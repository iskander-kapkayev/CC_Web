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
    /*
    let URL = `${servURL}/graballimages`;
    let imageURLs = await fetchDBData(URL); // this will fetch data from http request to grab all images
    */
    let img = document.getElementById('myImage');

    // Retrieving an array
    const storedArrayString = sessionStorage.getItem('imageURLs');
    const storedArray = JSON.parse(storedArrayString);

    currentIndex = (currentIndex + 1) % storedArray.length;
    img.src = storedArray[currentIndex];
    img.alt = `index ${currentIndex}`;

    // once an image is changed, then the currentIndex 
    // is changed and captions need to be grabbed
    await collectCaptions();
}

async function assignImage() {
    let URL = `${servURL}/graballimages`;
    let imageURLs = await fetchDBData(URL); // this will fetch data from http request to grab all images
    
    /*
    // we can now populate all urls into array
    imageURLs.forEach(url => {
        allImages.push(url);
    });
    */

    sessionStorage.setItem('imageURLs', JSON.stringify(imageURLs));

    // set the first image on start up
    let img = document.getElementById('myImage');
    img.src = imageURLs[currentIndex];
    img.alt = `index ${currentIndex}`;
    await collectCaptions();
}

// on start up of index.html
if (window.location.href === `${webURL}/`) {
    document.addEventListener('DOMContentLoaded', async function() {
        await assignImage();
    }); 
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
    return (signUpCheck.message === 'Success');
}

// registers a new user
async function signUpRegister(username, email, password) {
    // first check that you can sign up
    const uniqueUser = await signUpCheck(username, email);

    if (uniqueUser) {
        let URL = `${servURL}/register?username=${username}&email=${email}&password=${password}`;
        let regCheck = await fetchDBData(URL); // this will fetch a success or error for signing up
        return (regCheck.message === 'Success');
    } else {
        // if you can't sign up, then abort
        return false;
    }
}

// create a way to sign in as a regular user
async function signInUser(email, password) {
    let URL = `${servURL}/signin?email=${email}&password=${password}`;
    let signInCheck = await fetchDBData(URL); // this will fetch a success or error for signing up
    return (signInCheck.message === 'Success');

    // if we adjust this to successfully return the username
    if (signInCheck.message === 'Success') {
        URL = `${servURL}/findusername?email=${email}`;
        let usernameGrab = await fetchDBData(URL); // should return only 1 username
        allowUser.push(usernameGrab[0]); // push username into global space
    } else {
        alert('Password or email combination did not work. Try again.')
    }
}

/*
//test for signupregister works on page load
if (window.location.href === `${webURL}/`) {
    console.log('im on the front page');
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('im inside event listener');
        const registration = await signUpRegister('animasu', 'akuma@gmail.com', '829a7sd');
        if (registration) {
            console.log('registration was successful');
        } else {
            console.log('registration was a failure');
        }
    }); 
}
*/

// adding event listeners for user login and registration forms

if (window.location.href === `${webURL}/signup.html`) {
    
    document.addEventListener('DOMContentLoaded', async function() {
        
        // set reg and login forms
        const regForm = document.getElementById('registerFormData');

        // event listeners below
        regForm.addEventListener('submit', async function() {
            
            event.preventDefault(); // prevents redirection
            const regForm = document.getElementById('registerFormData');
            console.log('im in the forRegFunction');

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

    document.addEventListener('DOMContentLoaded', async function() {
        // set reg and login forms
        const loginForm = document.getElementById('loginFormData');

        // event listeners below
        loginForm.addEventListener('button', async function() {
            
            const loginForm = document.getElementById('loginFormData');

            // access the desired input through the var we setup
            const email = loginForm.elements.email;
            const password = loginForm.elements.password;

        });
    });
} // only runs on the login page script

/*
This section is for caption switching.
It connects with the image handler.
Only approved captions will be displayed
*/

// Display up to 10 posts
function displayCaptions(currentCaptions) {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = '';
    try {
        currentCaptions.slice(0, 20).forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <span id='postCaption'>${post.captiontext}</span><span id='postUser'> - ${post.username} </span> 
                <div id='postUpvotes'><a onclick='tester()'>&#x2764</a> ${post.upvotes}</div>
                
            `;
            postContainer.appendChild(postElement);
        });
    } catch (error) {
    console.error(error);
    }
}

// tester function
function tester() {
    // this function is clicked
    console.log('the tester function was clicked!');
}

// this function will grab captions for current image
async function collectCaptions() {
    // currentIndex + 1 will represent the imageID we are handling
    let URL = `${servURL}/collectcaptions?imageid=${currentIndex+1}`;
    let captions = await fetchDBData(URL);
    
    // display captions
    displayCaptions(captions);
}

/*
This section is for adding captions.
It connects with the image handler.
Only approved captions will be displayed
*/

const allowUser = [];

// placeholder for comments at the moment
function addCaption() {
    if (allowUser.length === 0){
        alert('You are not logged in... login first!')
    } else {
        const captionText = document.getElementById('captionInput');
        alert('Your caption has been posted. If flagged, it will be removed.')
    }
}
