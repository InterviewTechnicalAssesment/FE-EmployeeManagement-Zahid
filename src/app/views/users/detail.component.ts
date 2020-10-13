import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '../../_services';
import id from '@angular/common/locales/id';
import {registerLocaleData} from '@angular/common';

@Component({ templateUrl: 'detail.component.html' })
export class DetailComponent implements OnInit {
    id: string;
    loading = false;
    user: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.loading = true
        this.id = this.route.snapshot.params['id'];
        this.detailUser();
        registerLocaleData( id );
    }

    private detailUser() {
        console.log('this.id.value' , this.id);
        this.accountService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: data => {
                    this.user = data;
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
