import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEmployee } from './modules/employee/components/create-employee/create-employee';
import { EmployeeList } from './modules/employee/components/employee-list/employee-list';
import { UpdateEmployee } from './modules/employee/components/update-employee/update-employee';
import { ProjectList } from './modules/project/components/project-list/project-list';
import { CreateProject } from './modules/project/components/create-project/create-project';
import { UpdateProject } from './modules/project/components/update-project/update-project';
import { RequestList } from './modules/request/component/request-list/request-list';
import { CreateRequest } from './modules/request/component/create-request/create-request';
import { UpdateRequest } from './modules/request/component/update-request/update-request';
import { RequestDetails } from './modules/request/component/request-details/request-details';
import { ProjectDetails } from './modules/project/components/project-details/project-details';
import { EmployeeDetails } from './modules/employee/components/employee-details/employee-details';
import { Home } from './modules/home/home';
import { ClientList } from './modules/client/components/client-list/client-list';
import { UpdateClient } from './modules/client/components/update-client/update-client';
import { CreateClient } from './modules/client/components/create-client/create-client';
import { ClientDetails } from './modules/client/components/client-details/client-details';
import { BudgetList } from './modules/budget/components/budget-list/budget-list';
import { HistoryList } from './modules/budget/components/history-list/history-list';
import { CreateBudgetLine } from './modules/budget/components/create-budget-line/create-budget-line';
import { WelcomeComponent } from './modules/welcome/welcome';
import { Login } from './modules/login/login';
import { Profile } from './modules/profile/profile/profile';
import { AuthGuard } from './modules/auth/guards/auth-guard';
import { RoleGuard } from './modules/auth/guards/role-guard';
import { EmployeeDataGuard } from './modules/auth/guards/employee-data-guard';



const routes: Routes = [
  // PUBLIC ROUTES
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: Login },

  // HOME - ALL LOGGED IN
  { path: 'home', component: Home, canActivate: [AuthGuard] },

  // PROFILE PAGE - ALL LOGGED IN
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },

  // EMPLOYEE PROFILE - ONLY HIS DATA
  { 
    path: 'employees/details/:reference', 
    component: EmployeeDetails,
    canActivate: [AuthGuard, EmployeeDataGuard]
  },

  // ADMIN ONLY: EMPLOYEE MODULE
  { 
    path: 'employees', 
    component: EmployeeList,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'add-employee', 
    component: CreateEmployee,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'update-employee/:CIN', 
    component: UpdateEmployee,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'update-employee', 
    component: UpdateEmployee,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // ADMIN ONLY: CLIENT MODULE
  { 
    path: 'clients', 
    component: ClientList,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'add-client', 
    component: CreateClient,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'update-client/:idClient', 
    component: UpdateClient,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'clients/details/:idClient', 
    component: ClientDetails,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // ADMIN ONLY: BUDGET MODULE
  { 
    path: 'budget', 
    component: BudgetList,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'budget/history', 
    component: HistoryList,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'budget/create-line', 
    component: CreateBudgetLine,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // PROJECTS: ALL LOGGED IN (Backend filters by teamMember/projectLeader)
  { 
    path: 'projects', 
    component: ProjectList,
    canActivate: [AuthGuard]
  },
  { 
    path: 'add-project', 
    component: CreateProject,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'projects/edit/:id', 
    component: UpdateProject,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'projects/:id', 
    component: ProjectDetails,
    canActivate: [AuthGuard]
  },

  // REQUESTS: ALL LOGGED IN (Backend filters by creator)
  { 
    path: 'requests', 
    component: RequestList,
    canActivate: [AuthGuard]
  },
  { 
    path: 'requests/add', 
    component: CreateRequest,
    canActivate: [AuthGuard]
  },
  { 
    path: 'requests/edit/:id', 
    component: UpdateRequest,
    canActivate: [AuthGuard]
  },
  { 
    path: 'requests/:id', 
    component: RequestDetails,
    canActivate: [AuthGuard]
  },

  // CATCH ALL
  { path: '**', redirectTo: '/welcome' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
