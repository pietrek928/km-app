import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { KMService } from '../km.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private service: KMService) {}

  ngOnInit() {
    this.service.get_username().subscribe(
      (user) => {
        if (!environment.mock_api) {
          window.location.hash = '/save';
        }
      },
      (err) => {}
    );
  }

  login() {
    if (this.username && this.password) {
      this.service.login(this.username, this.password).subscribe((ok) => {
        window.location.hash = '/save';
      });
    }
  }
}
