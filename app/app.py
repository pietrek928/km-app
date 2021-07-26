from datetime import datetime, timedelta
from functools import wraps
from os import makedirs, environ
from secrets import compare_digest
from uuid import uuid4

from flask import Flask, request, jsonify, Response
from werkzeug.exceptions import Unauthorized, NotFound

DATA_DIR = environ.get('DATA_DIR') or '.'

SAVE_DIR = f'{DATA_DIR}/sheets'
USERS_FILE = f'{DATA_DIR}/users.txt'

sessions = {}


def _load_users(fname):
    users = {}
    with open(fname, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                user, password = line.split(' ')
                users[user] = password
    return users


USERS = _load_users(USERS_FILE)


def _clear_sessions(user=None):
    timestamp = datetime.utcnow()

    global sessions
    for sessid, session_data in tuple(sessions.items()):
        if session_data['expires'] < timestamp or session_data['user'] == user:
            del sessions[sessid]


def _authorize_user(sessid):
    if not sessid:
        raise Unauthorized('Authorization required')

    global sessions
    session_data = sessions.get(sessid)

    if session_data is None:
        raise Unauthorized('Invalid session')

    timestamp = datetime.utcnow()
    if session_data['expires'] < timestamp:
        raise Unauthorized('Session expired')

    return session_data['user']


def _login_user(username, password):
    if username not in USERS:
        raise NotFound('Invalid user name')

    if not compare_digest(USERS[username], password):
        raise Unauthorized('Invalid password')

    global sessions
    sessid = str(uuid4()).replace('-', '')
    expires = datetime.utcnow() + timedelta(days=10)
    session_data = {
        'user': username,
        'expires': expires
    }
    sessions[sessid] = session_data

    return sessid, expires


def api_request(anonymous=False):
    def decor(f):
        @wraps(f)
        def wrapper(anonymous=anonymous):
            if request.method == 'GET':
                args = request.args.to_dict()
            else:
                args = request.get_json(force=True)

            if not anonymous:
                args['user'] = _authorize_user(request.cookies.get('sessid'))

            r = f(**args)
            if not isinstance(r, Response):
                r = jsonify(r)
            return r

        return wrapper

    return decor


app = Flask(__name__)


@app.route("/api/login", methods=["POST"])
@api_request(anonymous=True)
def login_(username, password):
    sessid, expires = _login_user(username, password)
    resp = jsonify('OK')
    resp.headers['Set-Cookie'] = (
        f'sessid={sessid};'
        f'Expires={expires.strftime("%Y-%m-%d %H:%M:%S")};'
        f'Path=/api;'
    )
    return resp


@app.route("/api/logout", methods=["POST"])
@api_request()
def logout_(user):
    _clear_sessions(user=user)
    return 'OK'


@app.route("/api/username", methods=["POST"])
@api_request()
def username_(user):
    return user


@app.route("/api/save_position", methods=["POST"])
@api_request()
def save_position_(user: str, lng: float, lat: float, km: int):
    timestamp = datetime.utcnow()
    save_dir = f'{SAVE_DIR}/{user}'
    makedirs(save_dir, mode=0o700, exist_ok=True)
    with open(f'{save_dir}/{timestamp.month}.csv', 'a') as f:
        print(f'{timestamp.timestamp()},{lng},{lat},{km}', file=f)
    return 'OK'
