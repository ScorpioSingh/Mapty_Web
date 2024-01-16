'use strict';

// prettier-ignore


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout{
    date= new Date();
    id = (Date.now()+'').slice(-10);
    constructor(coords,distance,duration){
        this.coords =coords;
        this.distance=distance;//in km
        this.duration=duration;//in min
      
        
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
          months[this.date.getMonth()]
        } ${this.date.getDate()}`;
      }

}

class Running extends Workout{
    type='running';
constructor(coords,distance,duration,cadence){
    super(coords,distance,duration);
this.cadence = cadence;
this.calcPace();
this._setDescription();
}
calcPace(){
    this.pace = this.duration /this.distance;
    return this.pace;
}


}
class Cycling extends Workout{
    type='cycling';
    constructor(coords,distance,duration,elevation){
        super(coords,distance,duration);
        this.elevation = elevation;
        this.calcSpeed();
        this._setDescription();
    }
calcSpeed(){
    this.speed = this.distance /(this.duration/60);
    return this.speed;
}
}


//this class is for working/launching the web application
class App{
    #WorkoutsArray =[];
    #map;
    #mapEvent;
    constructor(){
        this._getPosition();
        //getting the old data from local storage
        this._getLocalStorage();
        form.addEventListener('submit',this._newWorkout.bind(this))

inputType.addEventListener('change',this._toggleElevationField);
containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));
    }
    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout');
    
        if(!workoutEl) return;
    
        const workout= this.#WorkoutsArray.find(work=> work.id===workoutEl.dataset.id);
        console.log(workout);

        this.#map.setView(workout.coords,13,{animate:true,pan:{duration:1}}); 

        
    }
    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'));
        console.log(data);

        if(!data) return;

        this.#WorkoutsArray = data; //load the existing data to workouts array
        this.#WorkoutsArray.forEach(work=>{
            this._renderWorkout(work);
            // this._renderWorkoutMarker(work);
        })
    }


    reset(){
        localStorage.removeItem('workouts');
        location.reload();
        //erasing local storage and reloading the web application
        
    }
    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#WorkoutsArray));
    
    }
    _getPosition(){
        //geolocation API
if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition((this._loadMap.bind(this)),function(){
        alert('Could not get current position.')
    })
    }

    }
    _loadMap(position){
        {
          
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
             this.#map = L.map('map').setView([latitude, longitude], 12);
             
            //adding map theme
     L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(this.#map);
     //setting the workout location marker using leaflet open source library
            this.#map.on('click',this._showForm.bind(this))
            
            this.#WorkoutsArray.forEach(work=>{
                // this._renderWorkout(work);
                this._renderWorkoutMarker(work);
            })

            
    }
    }
    _hideForm(){
        //empty inputs
        inputDistance.value=inputDuration.value=inputElevation.value=inputCadence.value='';
        form.style.displau='none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
            
    }
    _showForm(mapE){
      
        this.#mapEvent=mapE;
        form.classList.remove("hidden");
        inputDistance.focus(); //automatically user can input here
    }
    _toggleElevationField(){
       
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        // {
        //     //clearing the input fields
            
        //         //displaying the marker
             
        //     }
    }
    _newWorkout(e){
        e.preventDefault();
        const validInputs = (...inputs) =>inputs.every(inp=>Number.isFinite(inp));
        const allPositive =(...inputs)=>inputs.every(inp=>inp>0);
        //getting data from the from
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng } = this.#mapEvent.latlng;
        let workout;
        //check if data is valid
        //storing all the workouts when user gives a new entry for workout

        this._setLocalStorage();

        //if workout is running, create runing object
        if(type==='running'){
            const cadence = +inputCadence.value;
            if(!validInputs(distance,duration,cadence)
            || !allPositive(distance,duration,cadence)) return alert("Invalid Input");
         workout = new Running([lat,lng],distance,duration,cadence);
       
        }
        //if workout is cycling, create cycling object
        if(type==='cycling'){
            const elevation = +inputElevation.value;
            if(!validInputs(distance,duration,elevation)||
            !allPositive(distance,duration)) return alert("Invalid Input");
            workout = new Cycling([lat,lng],distance,duration,elevation);
            this.#WorkoutsArray.push(workout);
        }
        this.#WorkoutsArray.push(workout);
        console.log(this.#WorkoutsArray)
        //add new object to array

        //render workout on map
        this._renderWorkout(workout);
        //render workout on marker
        this._renderWorkoutMarker(workout)
        
  
        this._hideForm();

        //render workout on the list 

        //hide form and clear the input fields



       
  
}
_renderWorkout(workout){
let html=`   
 <li class="workout workout--${workout.type}" data-id="${workout.id}">
<h2 class="workout__title">${workout.description}</h2>
<div class="workout__details">
//   <span class="workout__icon">🏃‍♂️</span>
  <span class="workout__value">${workout.distance}</span>
  <span class="workout__unit">km</span>
</div>
<div class="workout__details">
//   <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">min</span>
</div>`;

if(workout.type==='running'){
    html+=`<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    // <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    // <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`}

if(workout.type==='cycling'){
    html+=`<div class="workout__details">
    // <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    //<span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
   // <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li> `
}

form.insertAdjacentHTML('afterend',html);

}


_renderWorkoutMarker(workout){
    L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({maxWidth:250,
        minWidth:100,
        autoClose:false,
    closeOnClick:false,
    className:`${workout.type}-popup`,
})).setPopupContent(` ${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`).openPopup();



}
}

const app = new App();
//this will trigger our construction











 


