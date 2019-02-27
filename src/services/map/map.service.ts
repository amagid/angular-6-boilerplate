import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, catchError, publishReplay, refCount, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {} from '@types/googlemaps';
import { PanelService } from '@services/panel/panel.service';
import { ModalService } from '@services/modal/modal.service';
import { Panel } from '@datatypes';
import { AuthenticationService } from '@app/core/authentication/authentication.service';

@Injectable()
export class MapService implements OnDestroy {

  constructor(private panelService: PanelService, private router: Router, private modalService: ModalService, private authService: AuthenticationService) {
    //Unfortunately, this seems to be the best way to attach click functionality to buttons in the InfoWindow.
    //This is because Angular does not reach into the google maps window, so we can't access anything in Angular
    //by default. The only way I can think of right now is to attach this function as a global and use a native
    //HTML onclick attribute to call it appropriately. While I don't like globals, I don't see better way.
    Object.defineProperty(window, 'viewPanelInfoPage', { value: this.allPanelsMap.viewPanelInfoPage });

    this.authService.onLogin(this.notifyOnDestroy, (loggedIn: boolean|null) => {
      if (loggedIn === false) {

        // Clear markers from map
        for (let panelId in this.allPanelsMap._markers) {
          this.allPanelsMap._markers[panelId].unbindAll();
          this.allPanelsMap._markers[panelId].setMap(null);
          delete this.allPanelsMap._markers[panelId];
        }

        // Reset map bounds
        this.allPanelsMap._mapBounds = new google.maps.LatLngBounds();
        this.allPanelsMap._map.fitBounds(this.allPanelsMap._mapBounds);

        // Clear the old InfoWindow
        this.allPanelsMap._infoWindow = new google.maps.InfoWindow();
      }
    });
  }

  notifyOnDestroy: Subject<null> = new Subject<null>();

  ngOnDestroy() {
    this.allPanelsMap._observable.complete();
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  allPanelsMap: {
    _observable: Subject<boolean>,
    _lastRun: number,
    _mapElement: any,
    _mapBounds: google.maps.LatLngBounds,
    _markers: Object,
    _infoWindow: google.maps.InfoWindow,
    _map: google.maps.Map,
    _getLatLng: (panel: Panel) => { lat: number, lng: number },
    get: () => Observable<any>,
    setMapElement: (element: any) => void,
    addMarker: (panel: Panel) => void,
    updateMarker: (panelId: number, updates: { newPos?: { lat: number, lng: number }, active?: boolean, status?: string }) => void,
    viewPanelInfoPage: (panelId: number) => void,
    _addInfoWindow: (panel: Panel) => void,
    _generateInfoWindowHTML: (info: any) => string,
    subscribe: (unsubscribe: Subject<null>, onNext: (results: any)=>void, onError?: (error: any)=>void, onComplete?: ()=>void) => Subscription
  } = {
    _observable: new Subject<boolean>(),
    _lastRun: 0,
    _mapElement: null,
    _mapBounds: null,
    _markers: {},
    _infoWindow: null,
    _map: null,
    _getLatLng: (panel: Panel) => {
      return { lat: panel.latitude, lng: panel.longitude };
    },
    get: () => {
      //Block duplicate requests made within a specified timeout period
      if (+(new Date) - this.allPanelsMap._lastRun >= environment.httpRefreshTimeout) {
        this.allPanelsMap._lastRun = +new Date;
        this.panelService.myPanels.subscribe(this.notifyOnDestroy, (panels: Panel[]) => {
          
          //Clear markers from map
          for (let panelId in this.allPanelsMap._markers) {
            this.allPanelsMap._markers[panelId].unbindAll();
            this.allPanelsMap._markers[panelId].setMap(null);
            delete this.allPanelsMap._markers[panelId];
          }
          
          this.allPanelsMap._mapBounds = new google.maps.LatLngBounds();

          this.allPanelsMap._map = this.allPanelsMap._map || new google.maps.Map(this.allPanelsMap._mapElement);
          this.allPanelsMap._infoWindow = this.allPanelsMap._infoWindow || new google.maps.InfoWindow();

          // Add a marker for all panels & calculate required map bounds
          for (let i = 0; i < panels.length; i++) {
            // Skip Panels that don't have locations
            if (!panels[i].latitude || !panels[i].longitude) {
              continue;
            }
            if (!panels[i].deletedAt) {
              this.allPanelsMap._mapBounds.extend(this.allPanelsMap._getLatLng(panels[i]));
            }
            this.allPanelsMap.addMarker(panels[i]);
          }

          this.allPanelsMap._map.fitBounds(this.allPanelsMap._mapBounds);
          this.allPanelsMap._observable.next(true);
        });
      }
      return this.allPanelsMap._observable.asObservable();
    },
    setMapElement: (element) => {
      this.allPanelsMap._mapElement = element;
    },
    addMarker: (panel) => {
      if (this.allPanelsMap._markers[panel.id]) {
        this.allPanelsMap._markers[panel.id].setMap(null);
      }
      // Don't add markers for Panels that don't have coordinates
      if (!panel.latitude || !panel.longitude) {
        return;
      }
      this.allPanelsMap._markers[panel.id] = new google.maps.Marker({ position: this.allPanelsMap._getLatLng(panel), map: this.allPanelsMap._map });
      this.allPanelsMap.updateMarker(panel.id, { active: !panel.deletedAt, status: panel.errorState ? 'error' : panel.unfinished ? 'unfinished' : 'ok' });
      this.allPanelsMap._addInfoWindow(panel);
    },
    updateMarker: (panelId, updates) => {
      if (updates.newPos && updates.newPos.lat && updates.newPos.lng) {
        this.allPanelsMap._markers[panelId].setPosition(updates.newPos);
        this.allPanelsMap._map.fitBounds(this.allPanelsMap._mapBounds.extend(updates.newPos));
      }
      if (updates.hasOwnProperty('active')) {
        this.allPanelsMap._markers[panelId].setVisible(updates.active);
        if (updates.active) {
          this.allPanelsMap._map.fitBounds(this.allPanelsMap._mapBounds.extend(this.allPanelsMap._markers[panelId].position));
        }
      }

      const baseIconPath = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|'
      if (updates.status === 'error') {
        this.allPanelsMap._markers[panelId].setIcon(baseIconPath + 'ff0000');
        this.allPanelsMap._markers[panelId].setZIndex(10);
      } else if (updates.status === 'unfinished') {
        this.allPanelsMap._markers[panelId].setIcon(baseIconPath + '0073dd');
        this.allPanelsMap._markers[panelId].setZIndex(5);
      } else if (updates.status === 'ok') {
        this.allPanelsMap._markers[panelId].setIcon(baseIconPath + '28a745');
        this.allPanelsMap._markers[panelId].setZIndex(2);
      } else {
        this.allPanelsMap._markers[panelId].setIcon(baseIconPath + '868e96');
        this.allPanelsMap._markers[panelId].setZIndex(1);
      }
    },
    viewPanelInfoPage: (panelId) => {
      this.modalService.deactivateModals();
      this.router.navigate(['/panels/' + panelId]);
    },
    _addInfoWindow: (panel) => {
      const info = panel;

      this.allPanelsMap._markers[panel.id].addListener('click', () => {
        this.allPanelsMap._infoWindow.close();
        this.allPanelsMap._infoWindow.setContent(this.allPanelsMap._generateInfoWindowHTML(info));
        this.allPanelsMap._infoWindow.open(this.allPanelsMap._map, this.allPanelsMap._markers[panel.id]);
      });
    },
    _generateInfoWindowHTML: (info) => {
      return ''
         + '<div class="panel_map_info_container">'
         + '  <div class="info_field">'
         + '    <div class="info_label">Name</div>'
         + '    <div class="info_value">' + (info.displayName || 'No Name Assigned') + '</div>'
         + '  </div>'
         + '  <div class="info_field ' + (info.deletedAt ? 'deactivated' : info.errorState ? 'error' : info.unfinished ? 'unfinished' : 'ok') + '">'
         + '    <div class="info_label">Status</div>'
         + '    <div class="info_value">' + (info.statusName || (info.unfinished ? 'Unfinished' : 'OK')) + '</div>'
         + '  </div>'
         + '  <div class="info_field ' + (info.deletedAt ? 'deactivated' : info.errorState ? 'error' : info.unfinished ? 'unfinished' : 'ok') + '">'
         + '    <div class="info_label">Status Description</div>'
         + '    <div class="info_value">' + (info.statusDescription || (info.unfinished ? 'This Panel needs more information. Go to its settings page to add details.' : 'This Panel is operating normally.')) + '</div>'
         + '  </div>'
         + '  <div class="info_field">'
         + '    <div class="info_label">Last Report At</div>'
         + '    <div class="info_value">' + (info.lastReportAt ? (new Date(info.lastReportAt)).toLocaleString() : 'No Reports Yet') + '</div>'
         + '  </div>'
         + '  <div class="info_field">'
         + '    <div class="info_label">Location</div>'
         + '    <div class="info_value">' + (info.location || 'No Location Set') + '</div>'
         + '  </div>'
         + '  <div class="info_field">'
         + '    <div class="info_label">Description</div>'
         + '    <div class="info_value">' + (info.description || 'No Description Set') + '</div>'
         + '  </div>'
         + '  <div class="info_field">'
         + '    <button class="button blue view_panel_page" onclick="window.viewPanelInfoPage(' + info.id + ')">See More Info</button>'
         + '  </div>'
         + '</div>';
    },
    subscribe: (unsubscribe: Subject<null>, onNext: (results: any)=>void = ()=>{}, onError: (error: any)=>void = ()=>{}, onComplete: ()=>void = ()=>{}) => {
      return this.allPanelsMap._observable.pipe(takeUntil(unsubscribe)).subscribe({ next: onNext, error: onError, complete: onComplete });
    }
  }
}
