import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TotemPage } from './totem.page';
import { TotemPageRoutingModule } from './totem-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TotemPageRoutingModule,
    TotemPage
  ],
  declarations: []
})
export class TotemPageModule {}
