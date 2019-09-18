import { Component, OnInit } from '@angular/core';
import { Dan } from 'models/dan';
import { HttpModule, Http, ResponseType } from '@angular/http';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {



  leto : number;
  mesec : string;
  danZacetka : string;
  steviloDniVMesecu:number;
  meseci:string[] = ['januar', 'februar', 'mart', 'april', 'maj', 
  'junij', 'julij', 'avgust', 'september', 'oktober', 'november', 'december'];
  dneviVTednu : string[] = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'];
  danVTednu :number;
  mesecStevilka : number;
  dnevi : Dan[];
  jeIzbrano : Boolean;
  reader:FileReader;


  prazniki:string;
  izbraniDan : number;

  text:any;




  datumIzbira:string;
  

  constructor(private http:Http) { }

  ngOnInit() {

    this.http.get('./assets/text.txt').subscribe(data => {
      this.text=((<any>data)._body);
      this.prazniki = this.text.split('\n');
    });
    this.jeIzbrano  = false;
    this.dnevi = [];
    
  }





  izberi(){
    this.dnevi = [];

    if(this.mesec == '1' || this.mesec == '3' || this.mesec == '5' 
        || this.mesec == '7' || this.mesec == '8' || this.mesec == '10' || this.mesec =='12'){
      this.steviloDniVMesecu = 31;

    }else
    if(this.mesec === '2'){
      if((this.leto % 4 === 0) && (this.leto % 100 !== 0) || (this.leto % 400 === 0)){
        this.steviloDniVMesecu = 29;
      }else{
        this.steviloDniVMesecu = 28;
      }
    }else{
      this.steviloDniVMesecu = 30;
    }

    this.mesecStevilka = +this.mesec;
    for(var i = 1; i <= this.steviloDniVMesecu; i++){
     
      let dan = {} as Dan;
      dan.danVMesecu = i;
      dan.leto = this.leto;
      dan.mesec = this.mesec;
      dan.aliJePrejsnjiMesec=false;
      dan.aliJeNedelja=false;
      dan.aliJePraznik=false;
      if(this.preveriAliJeNedelja(dan)){
        
       dan.aliJeNedelja = true;
      }
      if(this.preveriAliJePraznik(dan)){
       
        dan.aliJePraznik = true;
      }
      this.dnevi.push(dan);
    }
    var datum = new Date;
  
    datum.setDate(1);
    datum.setMonth(this.mesecStevilka-1);
    datum.setFullYear(this.leto);
    this.danVTednu = datum.getDay();

    var prejsnjiMesec;
    var leto = this.leto;
    if(this.mesecStevilka == 1){
      prejsnjiMesec = 12;
      leto = this.leto -1;
    }else{
      prejsnjiMesec = this.mesecStevilka-1;
    }
    
    var dneviPrejsnjegaMeseca : Dan[] = [];
    dneviPrejsnjegaMeseca = this.izracunZadnjihDnevPrejsnjegaMeseca(prejsnjiMesec, this.danVTednu, leto);
    for(var i = 0; i < this.danVTednu; i++){
      this.dnevi.unshift(dneviPrejsnjegaMeseca.pop());
    }
    this.jeIzbrano = true;
  }


  izracunZadnjihDnevPrejsnjegaMeseca(prejsnjiMesec:number, steviloZadnjihDnevi:number, leto:number) : Dan[]{
    var dnevi = [];
    var steviloDnevi = 0;
    if(prejsnjiMesec == 1 || prejsnjiMesec == 3 || prejsnjiMesec == 5 
        || prejsnjiMesec == 7 || prejsnjiMesec == 8 || prejsnjiMesec == 10 || prejsnjiMesec ==12){
      steviloDnevi = 31;
    }else
    if(prejsnjiMesec === 2){
      if((leto % 4 === 0) && (leto % 100 !== 0) || (leto % 400 === 0)){
        steviloDnevi = 29;
      }else{
        steviloDnevi = 28;
      }
    }else{
      steviloDnevi = 30;
    }
    for(var i = 1; i <= steviloZadnjihDnevi; i++){
      let dan = {} as Dan;
      dan.aliJePrejsnjiMesec=true;
      dan.leto = leto;
      dan.aliJeNedelja=false;
      dan.mesec=""+prejsnjiMesec;
      dan.danVMesecu = steviloDnevi - (steviloZadnjihDnevi - i);
     
      if(this.preveriAliJeNedelja(dan)){
        dan.aliJeNedelja = true;
      }
      dnevi.push(dan);
    }

    return dnevi;
  }

  izberiDatum(){
    var podatki = this.datumIzbira.split('.');
    this.mesec = 0+podatki[1];
    this.leto = +podatki[2];
    this.izbraniDan = +podatki[0];

    this.izberi();
  }

  preveriAliJePraznik(dan : Dan) : boolean {
  
    for(var i = 0; i < this.prazniki.length; i++){
       var day:number= +this.prazniki[i].split('.')[0];
       var month:number = +this.prazniki[i].split('.')[1];
       var year:number = +this.prazniki[i].split('.')[2];
       var ponavljajoci = false;
       if(this.prazniki[i].split('.').length == 4){
         ponavljajoci = true;
       }

       if(ponavljajoci == false){
         if(dan.danVMesecu == day && +dan.mesec == month && dan.leto == year){
            return true;
         }
       }
       if(ponavljajoci == true){
         if(i == 0){
         
         }
       
         if(dan.danVMesecu == day && +dan.mesec == month){
          
           return true;
         }
       }
       

    }
    return false;
  }

    /*izberiDatum(){
    var podatki = this.datumIzbira.split('.');
    this.mesec = 0+podatki[1];
    
    this.leto = +podatki[2];
    this.mesecStevilka = +this.mesec;


    this.dnevi = [];
    if(this.mesec == '1' || this.mesec == '3' || this.mesec == '5' 
        || this.mesec == '7' || this.mesec == '8' || this.mesec == '10' || this.mesec =='12'){
      this.steviloDniVMesecu = 31;
    }else
    if(this.mesec === '2'){
      if((this.leto % 4 === 0) && (this.leto % 100 !== 0) || (this.leto % 400 === 0)){
        this.steviloDniVMesecu = 29;
      }else{
        this.steviloDniVMesecu = 28;
      }
    }else{
      this.steviloDniVMesecu = 30;
    }
    for(var i = 1; i <= this.steviloDniVMesecu; i++){
      let dan = {} as Dan;
      dan.danVMesecu = i;
      dan.leto = this.leto;
      dan.mesec = this.mesec;
      this.dnevi.push(dan);
    }
    var datum = new Date;
  
    datum.setDate(1);
    datum.setMonth(this.mesecStevilka-1);
    datum.setFullYear(this.leto);
    this.danVTednu = datum.getDay();

    var prejsnjiMesec;
    var leto = this.leto;
    if(this.mesecStevilka == 1){
      prejsnjiMesec = 12;
      leto = this.leto-1;
    }else{
      prejsnjiMesec = this.mesecStevilka-1;
    }
  
    var dneviPrejsnjegaMeseca : Dan[] = [];
    dneviPrejsnjegaMeseca = this.izracunZadnjihDnevPrejsnjegaMeseca(prejsnjiMesec, this.danVTednu, leto);
    for(var i = 0; i < this.danVTednu; i++){
      this.dnevi.unshift(dneviPrejsnjegaMeseca.pop());
    }



    this.jeIzbrano = true;
  }*/

  preveriAliJeNedelja(day:Dan){


    var datum = new Date;
    datum.setDate(day.danVMesecu);
    datum.setMonth(+day.mesec-1);
    datum.setFullYear(day.leto, +day.mesec-1, day.danVMesecu);

  

    if(datum.getDay() == 0){
      return true;
    } 

    return false;
  }

}
