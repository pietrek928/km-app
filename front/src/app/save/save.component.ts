import { Component, OnInit } from '@angular/core';
import { KMService } from '../km.service';

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.css'],
})
export class SaveComponent implements OnInit {
  constructor(private service: KMService) {}

  km: number | null = null;
  username: string = '';
  msg: string = '';

  ngOnInit() {
    this.service.get_username().subscribe(
      (username) => {
        this.username = username;
      },
      (err) => {
        window.location.hash = '/login';
      }
    );
  }

  save() {
    if (this.username && this.km) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          this.service
            .save({
              km: this.km,
              lng: longitude,
              lat: latitude,
            })
            .subscribe((ok) => {
              alert('Pozycja zapisana');
            });
        },
        (err) => alert('Nie można pobrać pozycji')
      );
    }
  }

  logout() {
    this.service.logout().subscribe((ok) => {
      window.location.hash = '/login';
    });
  }
}
