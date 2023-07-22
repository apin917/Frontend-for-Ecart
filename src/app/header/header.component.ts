import { Component, OnInit } from '@angular/core';
import { ApiService } from '../products/services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{

  cartcounts:string='';

  constructor(private api:ApiService){}

  ngOnInit(): void {
    this.api.cartitemcount.subscribe((data:any)=>{
      console.log(data);
      this.cartcounts=data
    })
  }


  search(event:any){
    console.log(event.target.value);//value enterd from client
    this.api.searchTerm.next(event.target.value);
    
  }

}
