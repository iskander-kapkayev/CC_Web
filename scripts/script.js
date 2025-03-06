/*
Universal URL to access server
*/

const webURL = 'https://cc-web-iota.vercel.app';
const servURL = 'https://cc-server-lake.vercel.app';

/*
Async function call to fetch http request
*/

async function fetchDBData (URL) {
    let response = await fetch(URL);
    let data = await response.json();
    return data;
}

/*
This section is for image handling.
Will http request into localhost to retrieve URLs from database.
Then, function to cycle indices will move between images.

adjusted from localhost to vercel (which now hosts the server connection!)
*/

// create a way to cycle through the caption contest images (let's add more anime images!)
let currentIndex = 0;

async function moveToImage() {
    let URL = `${servURL}/graballimages`;
    let imageURLs = await fetchDBData(URL); // this will fetch data from http request to grab all images
    let img = document.getElementById("myImage");
    currentIndex = (currentIndex + 1) % imageURLs.length;
    img.src = imageURLs[currentIndex];
    img.alt = `index ${currentIndex}`;
}

/*
This section is for user handling.
Check if user exists then
Grab form data to sign in or register.
*/

// checks for a username/email that already exists
async function signUpCheck(username, email) {
    let URL = `${servURL}/checkifexists?username=${username}&email=${email}`;
    let signUpCheck = await fetchDBData(URL); // this will fetch a success or error for signing up
    (signUpCheck.message === "Success") ? true:false;
}


// registers a new user
async function signUpRegister(username, email, password) {
    
    // first check that you can sign up
    const uniqueUser = await signUpCheck(username, email);

    if (uniqueUser) {
        let URL = `${servURL}/register?username=${username}&email=${email}&password=${password}`;
        let regCheck = await fetchDBData(URL); // this will fetch a success or error for signing up
        (regCheck.message === "Success") ? true:false;
    } else {
        // if you can't sign up, then abort and alert console
        return false;
    }
}

// create a way to sign in as a regular user
async function signInUser(email, password) {

    let URL = `${servURL}/signin?email=${email}&password=${password}`;
    let signInCheck = await fetchDBData(URL); // this will fetch a success or error for signing up
    (signInCheck.message === "Success") ? true:false;
}

//test for signupregister works on page load
if (window.location.href === `${webURL}/`) {
    console.log("im on the front page");
    document.addEventListener("DOMContentLoaded", async function() {
        console.log("im inside event listener");
        const registration = await signUpRegister('animasu', 'akuma@gmail.com', '829a7sd');
        if (registration) {
            console.log('registration was successful');
        } else {
            console.log('registration was a failure');
        }
    }); 
}
// adding event listeners for user login and registration forms

if (window.location.href === `${webURL}/signup.html`) {
    console.log("im on the reg page");

    document.addEventListener("DOMContentLoaded", async function() {
        console.log("im in DomContent");
        // set reg and login forms
        const regForm = document.getElementById('registerFormData');

        // event listeners below
        regForm.addEventListener("submit", async function() {
            
            event.preventDefault(); // prevents redirection

            const regForm = document.getElementById('registerFormData');

            console.log("im in the forRegFunction");

            // access the desired input through the var we setup
            const username = regForm.elements.usernameReg.value;
            const email = regForm.elements.emailReg.value;
            const password = regForm.elements.passwordReg.value;
        
            // redirect user based on signup attempt
            if (await signUpRegister(username, email, password)) {
                window.location.href = webURL
            } else {
                window.location.href = `${webURL}/signup.html`;
            }
        });

    });
} // only runs on the signup page script

if (window.location.href === `${webURL}/login.html`) {

    document.addEventListener("DOMContentLoaded", async function() {
        // set reg and login forms
        const loginForm = document.getElementById('loginFormData');

        // event listeners below
        loginForm.addEventListener("button", async function() {
            
            const loginForm = document.getElementById('loginFormData');

            // access the desired input through the var we setup
            const email = loginForm.elements.email;
            const password = loginForm.elements.password;

            // redirect user based on signup attempt
            /*
            if (await signInUser(email, password)) {
                window.location.href = "https://caption-contest-server-35n2.vercel.app/";
            } else {
                window.location.href = "https://caption-contest-server-35n2.vercel.app/signup.html";
            }
            */

        });
    });
} // only runs on the login page script

/*
This section is for comment switching.
It connects with the image handler.
*/

// this function will connect with DB and find appropriate db captions for current image
// currentIndex + 1 will represent the imageID we are handling
async function displayCaptions() {
    let URL = `${servURL}/collectcaptions?imageid=${currentIndex+1}`;
    let captions = await fetchDBData(URL); // this will fetch data from http request to grab all captions
}

// placeholder for comments at the moment
function addComment() {
    const commentInput = document.getElementById('commentInput');
    const comments = document.getElementById('comments');

    if (commentInput.value.trim() !== "") {
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.textContent = commentInput.value;
        comments.appendChild(comment);
        commentInput.value = ""; // Clear the input
    } else {
        alert('Please enter a comment before submitting.');
    }
}
