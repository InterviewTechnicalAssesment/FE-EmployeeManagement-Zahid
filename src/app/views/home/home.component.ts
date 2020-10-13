import {Component, OnInit} from '@angular/core';

import { User } from '@app/_models';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    // user: User;

    title = 'This is Home!';
    user: User = {firstName: '',  id: '', username: '', password: '',
      lastName: '', token: '', email: '', birthDate: '', basicSalary: 0, status: '', group: '', description: ''};

    constructor(private accountService: AccountService) {
      // tslint:disable-next-line:max-line-length
        this.user = this.accountService.userValue ? this.accountService.userValue : {firstName: '',  id: '', username: '', password: '', lastName: '', token: '', email: '', birthDate: '', basicSalary: 0, status: '', group: '', description: ''};;
    }
}

