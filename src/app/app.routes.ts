import { Routes } from '@angular/router';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { RegisterComponentComponent } from './components/register-component/register-component.component';
import { SearchComponentComponent } from './components/search-component/search-component.component';
import { RouteComponentComponent } from './components/route-component/route-component.component';
import { ResultsComponentComponent } from './components/results-component/results-component.component';
import { UserComponentComponent } from './components/user-component/user-component.component';
import { HistoryComponentComponent } from './components/history-component/history-component.component';

export const routes: Routes = [
    { path: '', component: SearchComponentComponent},
    { path: 'ruta', component: RouteComponentComponent},
    { path: 'login', component: LoginComponentComponent },
    { path: 'register', component: RegisterComponentComponent },
    { path: 'results', component: ResultsComponentComponent},
    { path: 'preferences', component: UserComponentComponent},
    { path: 'history', component: HistoryComponentComponent}
];
