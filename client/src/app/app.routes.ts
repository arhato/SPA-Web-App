import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './page/about/about.component';
import { ContactComponent } from './page/contact/contact.component';
import { AddPostComponent } from './page/add-post/add-post.component';
import { CategoryComponent } from './page/category/category.component';
import { EditPostComponent } from './page/edit-post/edit-post.component';
import { HomeComponent } from './page/home/home.component';
import { LoginComponent } from './page/login/login.component';
import { ProfileComponent } from './page/profile/profile.component';
import { SearchComponent } from './page/search/search.component';
import { SignupComponent } from './page/signup/signup.component';
import { SinglePostComponent } from './page/single-post/single-post.component';


export const routes: Routes = [
    {  path: '', component: HomeComponent },
    {  path: 'about', component: AboutComponent },
    {  path: 'contact', component: ContactComponent },
    {  path: 'add-post', component: AddPostComponent },
    {  path: 'category/:category', component: CategoryComponent },
    {  path: 'edit-post/:id', component: EditPostComponent },
    {  path: 'login', component: LoginComponent },
    {  path: 'profile', component: ProfileComponent },
    {  path: 'search', component: SearchComponent },
    {  path: 'signup', component: SignupComponent },
    {  path: 'post/:id', component: SinglePostComponent },
    {  path: '**', redirectTo: '/' }
];
