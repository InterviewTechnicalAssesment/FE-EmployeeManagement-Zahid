import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import {AccountService, AlertService} from '../../_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit, AfterViewInit {
    @ViewChild(DataTableDirective, {static: false})
    dtElement: DataTableDirective;

    users = null;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();

    constructor(private accountService: AccountService, private alertService: AlertService, public router: Router) {}

    ngOnInit(): void {
        this.dtOptions = this.buildDtOptions();
        this.getUsers();
    }

    ngAfterViewInit(): void {
      this.dtTrigger.subscribe(() => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          // Get saved search value
          var state = dtInstance.state.loaded();
          if ( state ) {
            dtInstance.columns().eq( 0 ).each( function ( colIdx ) {
              var colSearch = state.columns[colIdx].search;

              // If exist, put it in every text input
              if ( colSearch.search ) {
                $( 'input', dtInstance.column( colIdx ).footer() ).val( colSearch.search );
              }
            } );
          }
          // Call search on every columns
          dtInstance.columns().every(function () {
            const that = this;
            $('input', this.footer()).on('keyup change', function () {
              if (that.search() !== this['value']) {
                that
                  .search(this['value'])
                  .draw();
              }
            });
          });
        });
      });
    }

    ngOnDestroy(): void {
      // Do not forget to unsubscribe the event
      this.dtTrigger.unsubscribe();
    }

    getUsers() {
      this.accountService.getAll()
            .pipe(first())
            .subscribe(users => {
              this.users = users;
              // Calling the DT trigger to manually render the table
              this.dtTrigger.next();
            });
    }

    deleteUser(id: string) {
        const user = this.users.find(x => x.id === +id);
        user.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => this.users = this.users.filter(x => x.id !== id));
        this.rerender();
        this.alertService.error('Delete successful', { keepAfterRouteChange: true });
    }

    buildDtOptions() {
      // Preparing DataTables Options
      return {
        scrollX:true,
        searching:true,
        stateSave: true,
        pagingType: 'full_numbers',
        pageLength: 10,
          sDom: 'lrtip',
        columns: [
        {"data" : "id"},
        {"data" : "username"},
        {"data" : "firstName"},
        {"data" : "lastName"},
        {"data" : null, "defaultContent" : `
<div class="row p-2">
          <i class="fas fa-eye text-primary col-md-12 col-lg mb-sm-1 mr-1 btn-zoom detailEmp"></i>
          <i class="fas fa-pencil-alt text-warning col-md-12 col-lg mb-sm-1 mr-1 btn-zoom editEmp"></i>
          <i class="fas fa-trash text-danger col-md-12 col-lg mb-sm-1  mr-1 btn-zoom deleteEmp"></i>
</div>`, "orderable" : false},
        ],
        // rowCallBack for click event in each row for datatable
        rowCallback: (row: Node, data: any | Object, index: number) => {
          const self = this;
          // Unbind first in order to avoid any duplicate handler
          $('.detailEmp', row).unbind('click');
          $('.detailEmp', row).bind('click', () => {
            this.router.navigate(['/employees/detail', data.id]);
          });
          $('.editEmp', row).unbind('click');
          $('.editEmp', row).bind('click', () => {
            this.router.navigate(['/employees/edit', data.id]);
          });
          $('.deleteEmp', row).unbind('click');
          $('.deleteEmp', row).bind('click', () => {
            this.deleteUser(data.id);
          });
          return row;
        }
      };
    }

    rerender(): void {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Create dtOptions again when rendering
        this.dtOptions = this.buildDtOptions();
        this.getUsers();
      });
    }
}
