import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, Validators } from '@angular/forms';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  showPaypalStatus:boolean = false;

  public payPalConfig?: IPayPalConfig;

  showSuccess: boolean = false;

  discountClicks: boolean = false;

  offerClicked: boolean = false;
  paymentStatus: boolean = false;

  name: string = ''
  email: string = ''
  housenumber: string = ''
  streetname: string = ''
  state: string = ''
  phonenumber: string = ''


  totalprice = 0

  //to hold cart products
  allcart: any = []
  cartcounts: any = []

  constructor(private api: ApiService, private fb: FormBuilder) { }
  ngOnInit(): void {

  this.initConfig();

  this.api.cartitemcount.subscribe((data:any)=>{
    this.cartcounts=data
  })

    this.api.getcart().subscribe((result: any) => {
      console.log(result);
      this.api.cartCount()
      this.allcart = result

      this.getcartTotal()



    }, (result: any) => {
      console.log(result.error);

    })
  }

  removecart(id: any) {
    this.api.deleteCart(id).subscribe((result: any) => {
      this.allcart = result
      this.api.cartCount()
    },
      (result: any) => {
        alert(result.error)
      })
  }

  //get cart total
  getcartTotal() {
    let total = 0
    this.allcart.forEach((result: any) => {
      total += result.grandTotal
      this.totalprice = Math.ceil(total)
    })

  }

  incrementCart(id: any) {
    this.api.incrementCartCount(id).subscribe((result: any) => {
      this.allcart = result
      this.getcartTotal()
    },
      (result: any) => {
        alert(result.error)
      })
  }

  // decrement
  decrementCart(id: any) {
    this.api.decrementCartCount(id).subscribe((result: any) => {
      this.allcart = result
      this.getcartTotal()
      this.api.cartCount()
    },
      (result: any) => {
        alert(result.error)
      })
  }

  //form group creation

  checkForm = this.fb.group({
    //array creation
    name: ['', [Validators.required, Validators.pattern('[a-zA-Z\\s]*')]],
    email: ['', [Validators.required, Validators.pattern('')]],
    housenumber: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    streetname: ['', [Validators.required, Validators.pattern('[a-zA-Z]*')]],
    state: ['', [Validators.required, Validators.pattern('[a-zA-Z]*')]],
    phonenumber: ['', [Validators.required, Validators.pattern('[0-9]*')]],


  })
  check() {
    if (this.checkForm.valid) {
      this.name = this.checkForm.value.name || '';
      this.email = this.checkForm.value.email || '';
      this.housenumber = this.checkForm.value.housenumber || '';
      this.streetname = this.checkForm.value.streetname || '';
      this.state = this.checkForm.value.state || '';
      this.phonenumber = this.checkForm.value.phonenumber || '';

      this.paymentStatus = true

    }
    else {
      alert("Invalid Form")
    }
  }

  offerClick() {
    this.offerClicked = true
    this.discountClicks=true
  }

  discount(value: any) {
    this.totalprice = this.totalprice * (100 - value) / 100
    this.offerClicked=false
  }



  // pay pal 
  private initConfig(): void {
    this.payPalConfig = {
    currency: 'EUR',
    clientId: 'sb',
    createOrderOnClient: (data) => <ICreateOrderRequest>{
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: '9.99',
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: '9.99'
              }
            }
          },
          items: [
            {
              name: 'Enterprise Subscription',
              quantity: '1',
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: 'EUR',
                value: '9.99',
              },
            }
          ]
        }
      ]
    },
    advanced: {
      commit: 'true'
    },
    style: {
      label: 'paypal',
      layout: 'vertical'
    },
    onApprove: (data, actions) => {
      console.log('onApprove - transaction was approved, but not authorized', data, actions);
      actions.order.get().then((details:any) => {
        console.log('onApprove - you can get full order details inside onApprove: ', details);
      });
    },
    onClientAuthorization: (data) => {
      console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
      this.showSuccess = true;
    },
    onCancel: (data, actions) => {
      console.log('OnCancel', data, actions);
    },
    onError: err => {
      console.log('OnError', err);
    },
    onClick: (data, actions) => {
      console.log('onClick', data, actions);
    },
  };
  }

  PaypalPay(){
    this.showPaypalStatus=true
  }

  modalClose(){
    this.checkForm.reset()
    this.showPaypalStatus=false
    this.showSuccess=false
    this.paymentStatus=false
  }


}
