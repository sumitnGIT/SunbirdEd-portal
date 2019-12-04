import { Component } from '@angular/core';
import { UserService } from '../../../core/services/user/user.service';
import { ManageService } from '../../services/manage/manage.service';
import { first } from 'rxjs/operators';
import * as _ from 'lodash-es';
import * as $ from 'jquery';
import 'datatables.net';
import * as moment from 'moment';

@Component({
    selector: 'app-user-org-management',
    templateUrl: 'user-org-management.component.html',
    styleUrls: ['user-org-management.component.scss']
})
export class UserOrgManagementComponent {

  public showModal = false;
  public userService: UserService;
  public userProfile: any;
  public geoData: any = {
    'districts': 0,
    'blocks': 0,
    'schools': 0
  };
  public uploadedDetails: any = {
    'total_uploaded': 0,
    'accounts_validated': 0,
    'accounts_rejected': 0,
    'accounts_failed': 0,
    'duplicate_account': 0,
    'accounts_unclaimed': 0
  };
  public geoSummary: any;
  public validatedUser: any = {
    'districts': 0,
    'blocks': 0,
    'schools': 0,
    'teachers': 0
  };
  public validatedUserSummary: any;
  public manageService: ManageService;
  public slug: any = (<HTMLInputElement>document.getElementById('defaultTenant'));
  public geoJSON: any = 'geo-summary.json';
  public geoCSV: any = 'geo-detail.csv';
  public geoDetail: any = 'geo-summary-district.json';
  public userJSON: any = 'user-summary.json';
  public userCSV: any = 'user-detail.csv';
  public userSummary: any = 'validated-user-summary.json';
  public userDetail: any = 'validated-user-summary-district.json';
  public userZip: any = 'validated-user-detail.zip';
  public geoButtonText = 'View Details';
  public teachersButtonText = 'View Details';
  public GeoTableId: any = 'GeoDetailsTable';
  public geoTableHeader: any = ['Serial No.', 'Districts', 'Blocks', 'Schools'];
  public geoTabledata: any = [];
  public userTableId: any = 'ValidatedUserDetailsTable';
  public userTableHeader: any = ['Serial No.', 'Districts', 'Blocks', 'Schools', 'Regd. Teachers'];
  public userTabledata: any = [];

  constructor(userService: UserService, manageService: ManageService) {
    this.userService = userService;
    this.manageService = manageService;
    if (this.slug) {
      this.slug = (<HTMLInputElement>document.getElementById('defaultTenant')).value;
    } else {
      this.slug = 'sunbird';
    }
  }

  ngOnInit(): void {
    this.userService.userData$.pipe(first()).subscribe(async (user) => {
      if (user && user.userProfile) {
        this.userProfile = user.userProfile;
        this.slug = await _.get(this.userService, 'userProfile.rootOrg.slug');
        if (user.userProfile && user.userProfile['rootOrg'] && !user.userProfile['rootOrg']['isSSOEnabled']) {
          this.getUserJSON();
        }
        this.getGeoJSON();
        this.getUserSummary();
        this.getGeoDetail();
        this.getUserDetail();
      }
    });
  }

  public getUserJSON() {
    this.manageService.getData(this.slug, this.userJSON).subscribe(
      data => {
        const result = JSON.parse(JSON.stringify(data.result));
        this.uploadedDetails = {
          'total_uploaded': result['accounts_validated'] + result['accounts_rejected'] + result['accounts_failed']
          + result['duplicate_account'] + result['accounts_unclaimed'],
          'accounts_validated': result['accounts_validated'] ? result['accounts_validated'] : 0,
          'accounts_rejected': result['accounts_rejected'] ? result['accounts_rejected'] : 0,
          'accounts_failed': result['accounts_failed'] ? result['accounts_failed'] : 0,
          'duplicate_account': result['duplicate_account'] ? result['duplicate_account'] : 0,
          'accounts_unclaimed': result['accounts_unclaimed'] ? result['accounts_unclaimed'] : 0
        };
      },
      error => {
        console.log(error);
      }
    );
  }

  public getGeoJSON() {
    this.manageService.getData(this.slug, this.geoJSON).subscribe(
      data => {
        console.log('dataaaaaaaaaaa', data);
        const result = JSON.parse(JSON.stringify(data.result));
        this.geoData = {
          'districts': result['districts'] ? result['districts'] : 0,
          'blocks': result['blocks'] ? result['blocks'] : 0,
          'schools': result['schools'] ? result['schools'] : 0
        };
      },
      error => {
        console.log(error);
      }
    );
  }

  public getUserSummary() {
    this.manageService.getData(this.slug, this.userSummary).subscribe(
      data => {
        const result = JSON.parse(JSON.stringify(data.result));
        this.validatedUser = {
          'districts': result['districts'] ? result['districts'] : 0,
          'blocks': result['blocks'] ? result['blocks'] : 0,
          'schools': result['schools'] ? result['schools'] : 0,
          'teachers': result['teachers'] ? result['teachers'] : 0
        };
      },
      error => {
        console.log(error);
      }
    );
  }

  public getGeoDetail() {
    this.manageService.getData(this.slug, this.geoDetail).subscribe(
      data => {
        const result = JSON.parse(JSON.stringify(data.result));
        this.geoSummary = result;
      },
      error => {
        console.log(error);
      }
    );
  }

  public getUserDetail() {
    this.manageService.getData(this.slug, this.userDetail).subscribe(
      data => {
        const result = JSON.parse(JSON.stringify(data.result));
        this.validatedUserSummary = result;
      },
      error => {
        console.log(error);
      }
    );
  }

  public renderGeoDetails() {
    setTimeout(() => {
         $(`#${this.GeoTableId}`).removeAttr('width').DataTable({
            retrieve: true,
            'columnDefs': [
                {
                    'targets': 0,
                    'render': (data) => {
                        const date = moment(data, 'DD-MM-YYYY');
                        if (date.isValid()) {
                            return `<td><span style="display:none">
                            ${moment(data, 'DD-MM-YYYY').format('YYYYMMDD')}</span> ${data}</td>`;
                        }
                        return data;
                    },
                }],
            'data': this.geoTabledata,
            'searching': false,
        });
    }, 100);
}

  public geoTableView() {
    if (this.geoButtonText === 'View Details') {
      this.geoButtonText = 'View Less';
      for (let i = 0; i < this.geoSummary.length; i++) {
        this.geoTabledata.push([
          this.geoSummary[i].index, this.geoSummary[i].districtName,
          this.geoSummary[i].blocks, this.geoSummary[i].schools
        ]);
        if (i === (this.geoSummary.length - 1)) {
          this.renderGeoDetails();
        }
      }
    } else {
      this.geoButtonText = 'View Details';
    }
  }

  public renderUserDetails() {
    setTimeout(() => {
         $(`#${this.userTableId}`).removeAttr('width').DataTable({
            retrieve: true,
            'columnDefs': [
                {
                    'targets': 0,
                    'render': (data) => {
                        const date = moment(data, 'DD-MM-YYYY');
                        if (date.isValid()) {
                            return `<td><span style="display:none">
                            ${moment(data, 'DD-MM-YYYY').format('YYYYMMDD')}</span> ${data}</td>`;
                        }
                        return data;
                    },
                }],
            'data': this.userTabledata,
            'searching': false,
        });
    }, 100);
}

  public teachersTableView() {
    if (this.teachersButtonText === 'View Details') {
      this.teachersButtonText = 'View Less';
      for (let i = 0; i < this.validatedUserSummary.length; i++) {
        this.userTabledata.push([
          this.validatedUserSummary[i].index, this.validatedUserSummary[i].districtName,
          this.validatedUserSummary[i].blocks, this.validatedUserSummary[i].schools,
          this.validatedUserSummary[i].registered
        ]);
        if (i === (this.validatedUserSummary.length - 1)) {
          this.renderUserDetails();
        }
      }
    } else {
      this.teachersButtonText = 'View Details';
    }
  }

  public openModal() {
    this.showModal = false;
    setTimeout(() => {
      this.showModal = true;
    }, 500);
  }

  public downloadCSVFile(fileName: any) {
    this.manageService.getData(this.slug, fileName)
    .subscribe(
      response => {
        const data = (_.get(response, 'result'));
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = downloadUrl;
        a.download = fileName;
        a.click();
        document.body.removeChild(a);
      },
      error => {
        console.log(error);
      }
    );
  }

  public downloadZipFile(fileName: any) {
    this.manageService.getData(this.slug, fileName)
    .subscribe(
      response => {
        if (response && response.result && response.result.signedUrl) {
          window.open(response.result.signedUrl, '_blank');
        }
      },
      error => {
        console.log(error);
      }
    );
  }

}