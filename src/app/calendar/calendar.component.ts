import { Component, OnInit } from '@angular/core';
import { Dan } from 'models/dan';
import { HttpModule, Http, ResponseType } from '@angular/http';
import { LowerCasePipe } from '@angular/common';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

/*Spodaj je en enostavni program koledarja. Kot je vidno, izdelan je z uporabo Angular tehnologije. Za izboljšavo HTML 
  kode sem se poslužil z Bootstrap-om. Obstajata dva načina vnosa in izbire mesecev. 
  Uporabnik lahko preko combo-boxa izbere določeni mesec in v polje vpiše leto, drugi način je pa da v polje vnese 
  celoten datum. Ko ni uporabnikovega vnosa, koledar je skrit in se pokaže, ko je gumb "Potrdi" aktiven.
  
  Za določanje dnevov sem naredil en model "Dan", ki v sebi hrani podatke :
    -število danVMesecu
    -število leto
    -string mesec
    -boolean aliJePraznik
    -boolean aliJeNedelja
    -boolean aliJePrejsnjiMesec


    Gumba "Potrdi" sta onemogočena dokler program ne potrdi veljavnost vnosov.
  */



  leto: number;
  mesec: string;
  steviloDniVMesecu: number;
  meseci: string[] = ['januar', 'februar', 'mart', 'april', 'maj', 
  'junij', 'julij', 'avgust', 'september', 'oktober', 'november', 'december'];
  dneviVTednu: string[] = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'];
  danVTednu: number;
  mesecStevilka : number;
  dnevi: Dan[];
  jeIzbrano: Boolean;
  
  prazniki: string;
  
  izbraniDan: number;

  /* Te spremenljivke služijo uporabniku izpisati izbrani mesec in leto.*/
  mesecZaIzpis : string;
  letoZaIzpis : number;
 

  text: any;




  datumIzbira: string;
  

  constructor(private http: Http) { }

  ngOnInit() {
    /* Ta delček kode iz "assets" direktorija pridobi tekstualno datoteko, prebere je, in podatke shrani
      v spremenljivko "this.prazniki". Izvaja se ob začetku programa.*/
    this.http.get('./assets/text.txt').subscribe(data => {
      this.text=((<any>data)._body);
      this.prazniki = this.text.split('\n');
    });
    /* Omogoča skritost koledarja. Ob pritisku na gumb "Potrdi", se spremenljivka "jeIzbrano" spremeni v true
      in se koledar prikaže */
    this.datumIzbira = "";
    this.jeIzbrano  = false;
    this.dnevi = [];
    
  }




  /*Izberi() je glavna funkcija v programu, in je njena vloga da uporabnikov unos prebere, obdela, izračuna potrebne
   podatke za prikaz koledarja in omogoči prikaz. */
  izberi(){

    this.dnevi = [];
    /*Izračunamo število dni določenega meseca v določenemu letu*/
    if(this.mesec == '1' || this.mesec == '3' || this.mesec == '5' 
        || this.mesec == '7' || this.mesec == '8' || this.mesec == '10' || this.mesec =='12'){
      this.steviloDniVMesecu = 31;

    }else
    /*Vsako četrto leto je prestopno, s tem da je vsako 100-to leto prestopno samo v primeru če je deljivo z 400.
      Prestopnost leta se seveda odrazi samo v februarju.*/
    if(this.mesec === '2'){
      if((this.leto % 4 === 0) && (this.leto % 100 !== 0) || (this.leto % 400 === 0)){
        this.steviloDniVMesecu = 29;
      }else{
        this.steviloDniVMesecu = 28;
      }
    
    }else{
      this.steviloDniVMesecu = 30;
    }
    /*Spodaj iteriramo skozi dneve in delamo objekte tipa Dan. Za vsak objekt je znano leto, mesec in dan v mesecu.
      S temi podatki lahko preverimo ali je leto nedelja ali praznik. Če je, potem to označimo v booleanu "aliJeNedelja",
        oziroma "aliJePraznik*/
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

      if(this.izbraniDan == dan.danVMesecu){
        dan.aliJeIzbran = true;
        this.izbraniDan = 0;
      }
      /*Dodamo v seznam*/
      this.dnevi.push(dan);
      this.mesecZaIzpis = this.meseci[+this.mesec-1].charAt(0).toUpperCase() +
        this.meseci[+this.mesec-1].slice(1);
      this.letoZaIzpis = this.leto;
    }

    /*Spodaj z uporabo tipa Date lahko dobimo dan v tednu določenega datuma. */
    var datum = new Date;

    datum.setDate(1);
    datum.setMonth(this.mesecStevilka-1);
    datum.setFullYear(this.leto);
    this.danVTednu = datum.getDay();

    /* Ko nam se zgodi, da se mesec ne začne točno v nedeljo, potem do 1. v izbranemu mesecu moramo dodati
      nekaj dni iz prejšnjega meseca. To izračunamo kot this.mesec - 1 in v slučaju da smo izbrali januar
      this.mesec je 12, zmanjša se pa leto za 1.*/
    var prejsnjiMesec;
    var leto = this.leto;
    if(this.mesecStevilka == 1){
      prejsnjiMesec = 12;
      leto = this.leto -1;
    }else{
      prejsnjiMesec = this.mesecStevilka-1;
    }


    /* Dneve iz prejšnjega meseca bomo dodali na začetek seznama in njihovo število bo ustrezalo
      potrebnemu številu dni za dopolnitev tabele do začetka trenutno izbranega meseca. Kličemo funkcijo 
      izracunZadnjihDnevPrejsnjegaMeseca in jih dobimo kot seznam objektov tipa Dan[]. */
    var dneviPrejsnjegaMeseca : Dan[] = [];
    dneviPrejsnjegaMeseca = this.izracunZadnjihDnevPrejsnjegaMeseca(prejsnjiMesec, this.danVTednu, leto);
    for(var i = 0; i < this.danVTednu; i++){
      this.dnevi.unshift(dneviPrejsnjegaMeseca.pop());
    }
    this.jeIzbrano = true;
  }


  izracunZadnjihDnevPrejsnjegaMeseca(prejsnjiMesec:number, steviloZadnjihDnevi:number, leto:number) : Dan[]{

    /*Postopek je podoben kot pri glavni funkciji. Razlika je v tem,
      da vrnemo samo število potrebnih dni na koncu meseca kot seznam.*/
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







  /* Funkcija ki se kliče ob vnosu v polje datuma. Iz string-a ki ga dobimo iz vmesnika z pomočjo funkcije split
    lahko izberemo potrebne podatke, in pokličemo funkcijo izberi(), ki bo podatke dalj obdelala.*/
  izberiDatum(){
    
      if(this.datumIzbira === undefined){
        return false;
      }
      var podatki = this.datumIzbira.split('.');
      this.mesec = 0+podatki[1];
      this.leto = +podatki[2];
      this.izbraniDan = +podatki[0];

      this.izberi();
    
  }
  /* Na začetku imamo pripravljen seznam stringov "prazniki". Iteriramo skozi seznam in preverjamo ali je 
    praznik ponavljajoč, kar je označeno z "*" na koncu string-a. */
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
         /* Praznik ni ponavljajoč. Da bi praznik lahko označili v koledarju, moramo preveriti ali 
          dan, mesec in leto ustrezajo podatkom iz seznama "prazniki".*/
         if(dan.danVMesecu == day && +dan.mesec == month && dan.leto == year){
            return true;
         }
       }

       if(ponavljajoci == true){
         /*Če praznik je ponavljajoč, potem nam ni potrebno preverjati ali je leto izbranega meseca enako kot pri 
          podatku. */
         if(dan.danVMesecu == day && +dan.mesec == month){
           return true;
         }
       }
    }
    return false;
  }

  preveriAliJeNedelja(day: Dan){


    var datum = new Date;
    datum.setDate(day.danVMesecu);
    datum.setMonth(+day.mesec - 1);
    datum.setFullYear(day.leto, +day.mesec - 1, day.danVMesecu);

  
    /* Pri tipu Date, če nam metoda getDay() vrne 0, pomeni da je datum nedelja. To v funkciji ki kliče 
      preveriAliJeNedelja(day: Dan) ustrezno označimo v objektu.*/
    if(datum.getDay() == 0){
      return true;
    }

    return false;
  }

  preveriAliJeVnosVeljaven() : boolean{
    if(this.leto > 0){
      return true;
    }
    return false;
  }

  preveriAliJeVnosDatumaVeljaven() : boolean {
    if(this.datumIzbira == ""){
      return false;
    }
    var podatki = this.datumIzbira.split('.');
    if(podatki.length < 3){
      console.log("podatki ne valjaju");
      return false;
    }
    var mesec = 0+podatki[1];
    var leto = +podatki[2];
    var izbraniDan = +podatki[0];
    //septembar april jun novembar
    if((mesec == null) || (+mesec < 1) || (+mesec > 12) || (leto == null) || (leto < 1) || 
     (izbraniDan == null) || (izbraniDan < 1) || (izbraniDan > 31)){
      console.log(mesec);
       console.log("izbrani ne valjaju");
        return false;
    }

    if(+mesec == 9 || +mesec == 4 || +mesec == 6 || +mesec == 11){
      if(izbraniDan > 30){
        console.log(mesec);
        console.log("izbrani dan ne valja");
        return false;
      }
    }

    if((leto % 4 == 0) && (leto % 100 != 0) ||(leto % 400 == 0)){
      if(izbraniDan > 29){
        console.log("ovde ne valja");
        return false;
      }
    }else{
      if(izbraniDan > 28){
        console.log("ovde ne vala2");
        return false;
      }
    }

    return true;
    
  }

  preveriAliJeVnosLetaInMesecaVeljaven(){
    if(this.leto == null || this.leto < 1 ){
      return false;
    }
    if(this.mesec == null){
      return false;
    }
    return true;
  }

}
