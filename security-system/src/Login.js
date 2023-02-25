import React, {Component} from "react";
import fire from "./config/firebase.js";
import Home from "./Home.js"
import { BrowserRouter as Router, Link, NavLink, Redirect, Prompt} from 'react-router-dom';
import ChangePW from "./ChangePW.js";
import AddData from "./AddData.js";
import ViewHistory from "./ViewHistory";
import Edit from "./Edit.js";

const CryptoJS = require('crypto-js');
const key = CryptoJS.enc.Utf8.parse('1234567890123456');

class Login extends Component{
    constructor(props){
        super(props)
        this.login =this.login.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getNumber =this.getNumber.bind(this);
        this.getnewStatus = this.getnewStatus.bind(this);
        this.OnSignInSubmit =this.OnSignInSubmit.bind(this);
        this.OnSubmitOtp = this.OnSubmitOtp.bind(this);
        this.decrypt =this.decrypt.bind(this);
        this.state ={
            email : "",
            password : "",
            isLoggedIn : false,
            isContinue :false,
            isCancel :false,
            DBtag:'',
            isExit:false,
            status :'',
            otp:'',
            changePW:false

        }
    }
   
    decrypt(ciphertextStr){
        let ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
        console.log(ciphertextStr)
        // split IV and ciphertext
        let iv = ciphertext.clone();
        iv.sigBytes = 16;
        iv.clamp();
        ciphertext.words.splice(0, 4); // delete 4 words = 16 bytes
        ciphertext.sigBytes -= 16;

        // decryption
        let decrypted = CryptoJS.AES.decrypt({ciphertext: ciphertext}, key, {
            iv: iv
        });
        console.log("decrpted msg");
        return(decrypted.toString(CryptoJS.enc.Utf8));
    }       

    UpdateTime(){
        let count=0;
        
            count++;
            const empref = fire.database().ref("/AdminProfiles");
            empref.on("value", snapshot => {
            // console.log(snapshot.val().enter_date);
            let AdminData= snapshot.val();
            console.log("/Admin",AdminData)
            // console.log(snapshot.child("/AdminId").val());
        
            for(let id in AdminData){
                var storedemail =AdminData[id]['Email'];
                    
                if(storedemail == this.state.email){
                    console.log('id',id)
                    this.setState({ DBtag: id });
                    break;
                }
                else{
                     console.log("no match")
                }
                
            }

            
            
            
            }); 

        


            const empref2 = fire.database().ref("/AdminProfiles/"+this.state.DBtag);
            empref2.update({
            LastSignIn :  Date().toLocaleString(),
            });
            console.log('Sign in time update complete')
         
    }
    login(){
//e.preventDefault();
        fire.auth().signInWithEmailAndPassword(this.state.email,this.state.password).then((u)=>{
            console.log(u)
            console.log("sign in successful")
            let user = fire.auth().currentUser;
           if(user.emailVerified){
            this.setState({isLoggedIn:true}) 
           this.UpdateTime();
           this.getnewStatus();
        } 
        else{
            document.querySelector('#regmsg').textContent='Sign in failed. Email not verified !!';
        }
            
        }).catch((err)=>{
            console.log(err)
            document.querySelector('#regmsg').textContent='Sign in failed. Try again !!';
        })
        
    }
    
    handleChange(e){
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    
    //otp

    getNumber=()=>{
        let number=''
        const empref = fire.database().ref("/OTPnumber");
        empref.on("value", snapshot => {
          
          number = snapshot.val();
          console.log(number);
    
        });
        
        return number;
    
    }
    getnewStatus=()=>{
        let st;
        if(this.state.isLoggedIn){
        const empref = fire.database().ref("/AdminProfiles");
            empref.on("value", snapshot => {
              // console.log(snapshot.val().enter_date);
              
              let Admindata = snapshot.val();
            console.log("/AdminP",Admindata)
            //console.log(snapshot.child("/AdminId").val());
            
           
                for(let id in Admindata){
                    
                    var storedemail =Admindata[id]['Email'];
                    console.log('storedemail',storedemail)
                    if(storedemail == this.state.email){
                        console.log('id',id)
                        st =Admindata[id]['SecurityStatus'];
                       this.setState({ status: this.decrypt(Admindata[id]['SecurityStatus'] ) });
                     
                    }
                   
                
                }

            }); 
        }
        
            
    }

    setUpRecaptcha = () => {
        
         
        window.recaptchaVerifier = new fire.auth.RecaptchaVerifier(
          "recaptcha-container",
          {
            size: "invisible",
            callback: function (response) {
              console.log("Captcha Resolved");
             this.OnSignInSubmit();
            },
            defaultCountry: "IN",
          }
        );
      };


    OnSignInSubmit = (e) => {
        e.preventDefault();
        this.setUpRecaptcha();
        let phoneNumber ;
        const empref = fire.database().ref("/OTPnumber");
        empref.on("value", snapshot => {
          
          phoneNumber = snapshot.val();
          
    
        });
        
        console.log(phoneNumber);
        let appVerifier = window.recaptchaVerifier;
        fire
          .auth()
          .signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(function (confirmationResult) {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            // console.log(confirmationResult);
            console.log("OTP is sent");
            document.querySelector("#newcontainer").innerHTML = '<label>OTP sent !</label>';
          })
          .catch(function (error) {
            console.log(error);
            window.recaptchaVerifier.reset()

          });
      };
    
    OnSubmitOtp = (e) => {
        e.preventDefault();
        let otpInput = this.state.otp;
        let optConfirm = window.confirmationResult;
        // console.log(codee);
        optConfirm
          .confirm(otpInput)
          .then(function (result) {
            // User signed in successfully.
            // console.log("Result" + result.verificationID);
            let user = result.user;
            document.querySelector("#newcontainer").innerHTML = '<label>Step 2 verification successfull !</label>';
            //document.querySelector("#newcontainer").innerHTML = '<Link to="/sortById"/>';  //try this
            //inside query if body used as key and = to link then page empty
            document.querySelector('#newlink').textContent="ClickHereToContinue";
           // document.querySelector('#pwchangelink').textContent="ClickHereToChangeYourPassword";
          })
          .catch(function (error) {
            console.log(error);
            window.recaptchaVerifier.reset()

            document.querySelector("#newcontainer").innerHTML = '<label>incorrect OTP. If you need another OTP press Cancel button and start again!!</label>';
            
          });
      };

   
    render(){
       
      
        const isLoggedIn =this.state.isLoggedIn;
        //this.UpdateTime();
        
        if(this.state.isContinue){ //correct
        //if(isLoggedIn){

                if(this.state.status==='ENTERDATA'){
                    
                    return <Link to="/AddData"component={AddData}/>;  //this is correct  
                }
               else if(this.state.status=="UPDATEDATA"){
                
                    return <Link to="/Edit"component={Edit}/>;  //this is correct  
                }
                else if(this.state.status=="VIEWDATA"){
                
                    return <Link to="/ViewHistory"component={ViewHistory}/>;  //this is correct  
                }
                else{
                    
                    return  <Link to="/home"component={Home}/>;
                } 
        }
        if(this.state.changePW){
            return <Link to="/ChangePW"component={ChangePW}/>; 
        }
        
        if(this.state.isExit| this.state.isCancel){
            return <Link to="/home"component={Home}/>; 
        }
       if (isLoggedIn) {
            
            return(
          
          <div>
             
            
              
          <br/>
          <div class="alert alert-dismissible alert-info">
          <br/> 
              <strong>step 1 verification is successfull.!</strong>
              <br/> 
              <p class="text-muted">Enter cancel to exit or enter continue to procceed</p>
              <br/> 
          </div>
          
          <table>
          
          <tr>
          <td>
          <button type="button" class="btn btn-primary" onClick={() => {

              this.setState({isCancel: true});
              }}>Cancel
          </button>    

           <button type="button" class="btn btn-primary" id ='SentOtp' onClick=
              {this.OnSignInSubmit}
              >Continue
          </button>
          
          <br/><br/>

         
          <div class="form-group">
                        
             <input type="number" class="form-control" name="otp" onChange = {this.handleChange}  autoComplete='off' id="otp" placeholder="input OTP"
                        value ={this.state.otp}
             />
         </div>
         <button type="button" class="btn btn-primary"onClick=
              {this.OnSubmitOtp}
              >Submit
          </button>
         
          <div id="recaptcha-container"></div> 
          <div id="newcontainer"></div>
          <br/><br/> 
          <button id="newlink" type="button" class="btn btn-link"
          onClick={() => {

              this.setState({isContinue: true});
              }}></button>
        <button id="pwchangelink" type="button" class="btn btn-link"
          onClick={() => {

              this.setState({changePW: true});
              }}>ClickHereToChangeYourPassword</button>          
</td>
<td><img src="/images/image9.jpeg"   width="90%" height="250" align="right"></img></td>
 </tr>
</table>

      </div>
  )
          }
        return(
            <div>
                <table>
                    <tr>
                        <td><img src="/images/image6.jpg"   width="90%" height="500"></img></td>
                        <td>
                        <form>
                <fieldset>
                    <legend>Sign in</legend>
                    
                    <div class="form-group">
                        <label for="exampleInputEmail1" id ='labelemail'>Email address</label>
                        <input type="email" class="form-control" name="email" id="email" aria-describedby="emailHelp" placeholder="Enter email"
                        onChange = {this.handleChange}
                        value ={this.state.email} autoComplete='off'
                        />
                        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                    </div>
                    <div class="form-group">
                        <label for="exampleInputPassword1">Password</label>
                        <input type="password" class="form-control" name="password" onChange = {this.handleChange} id="password" placeholder="Password"
                        value ={this.state.password}
                        />
                    </div>
                    
                    <button type="button" class="btn btn-primary"  id='SignInBtn' onClick={()=>this.login()}>Sign in</button>
                    <button type="submit" class="btn btn-primary" id='exitbtn' onClick={() => {
  
                     this.setState({isExit: true});
                    }}>Exit</button>
                 
                    

                </fieldset>
                </form>
                <p class="text-warning" id='regmsg'></p>
                </td>
                </tr>
                </table>
            </div>
        )
    }
}

export default Login;