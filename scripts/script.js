/*
Universal URL to access server
*/

const webURL = 'https://cc-web-iota.vercel.app';
const servURL = 'https://cc-server-lake.vercel.app';

/*
Async function call to fetch http request.
One will be for gets.
One will be for posts.
*/

async function getDBData (URL) {
    const response = await fetch(URL);
    const data = await response.json();
    return data;
}

// we need a post without authorization to
// sign up check, sign in user, register a user
async function postNoAuth(URL, bodyData) {
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // ensures the body is in JSON format
        },
        body: JSON.stringify(bodyData)  // stringifies the data to send in the body
    });
    const data = await response.json();
    return data;
}

// we need a post with authorization to
// write a caption, heart a caption
async function postAuth(URL, bodyData, token) {
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // set body format to json
            'Authorization': `Bearer ${token}` // send authorization token
        },
        body: JSON.stringify(bodyData)  // stringifies the data to send in the body
    });
    const data = await response.json();
    return data;
}

/*
This section is for image handling.
Will http request into localhost to retrieve URLs from database.
Then, function to cycle indices will move between images.
adjusted from localhost to vercel (which now hosts the server connection!)
*/

// create a way to cycle through the caption contest images (let's add more anime images!)
// let currentIndex = 0;


async function moveToImageNext() {
    /*
    let URL = `${servURL}/graballimages`;
    let imageURLs = await fetchDBData(URL); // this will fetch data from http request to grab all images
    */
    let img = document.getElementById('myImage');

    // Retrieving an array
    const storedArrayString = sessionStorage.getItem('imageURLs');
    const storedArray = JSON.parse(storedArrayString);
    
    let currentIndex = Number(sessionStorage.getItem('currentIndex'));

    currentIndex = (currentIndex + 1) % storedArray.length;
    img.src = storedArray[currentIndex];
    img.alt = `index ${currentIndex}`;

    sessionStorage.setItem('currentIndex', currentIndex); // set new currentIndex

    // once an image is changed, then the currentIndex 
    // is changed and captions need to be grabbed
    await collectCaptions();
}

async function moveToImagePrev() {
    /*
    let URL = `${servURL}/graballimages`;
    let imageURLs = await fetchDBData(URL); // this will fetch data from http request to grab all images
    */
    let img = document.getElementById('myImage');

    // Retrieving an array
    const storedArrayString = sessionStorage.getItem('imageURLs');
    const storedArray = JSON.parse(storedArrayString);

    let currentIndex = Number(sessionStorage.getItem('currentIndex'));
    
    currentIndex = (currentIndex - 1); // subtract by 1
    if (currentIndex < 0) {
        // if currentIndex is now -1
        // cycle back to the max.length of images
        const maxImages = 5;
        currentIndex = maxImages;
    } else {
        // currentInfex is not -1
        currentIndex = (currentIndex) % storedArray.length;
    }
    img.src = storedArray[currentIndex];
    img.alt = `index ${currentIndex}`;

    sessionStorage.setItem('currentIndex', currentIndex); // set new currentIndex

    // once an image is changed, then the currentIndex 
    // is changed and captions need to be grabbed
    await collectCaptions();
}

async function assignImage() {
    let URL = `${servURL}/graballimages`;
    let imageURLs = await getDBData(URL); // this will fetch data from http request to grab all images
    
    /*
    // we can now populate all urls into array
    imageURLs.forEach(url => {
        allImages.push(url);
    });
    */

    sessionStorage.setItem('imageURLs', JSON.stringify(imageURLs));
    sessionStorage.setItem('currentIndex', 0); // initialize currentIndex at 0

    // set the first image on start up
    let img = document.getElementById('myImage');
    const currentIndex = Number(sessionStorage.getItem('currentIndex'));
    img.src = imageURLs[currentIndex];
    img.alt = `index ${currentIndex}`;
    await collectCaptions();
}

// on start up of index.html
if (window.location.href === `${webURL}/`) {
    
    document.addEventListener('DOMContentLoaded', async function() {
        
        // grab images for display
        await assignImage();

        // set reg and login forms
        const captionForm = document.getElementById('captionFormData');

        // event listeners below
        captionForm.addEventListener('submit', async function() {
            
            event.preventDefault(); // prevents redirection
            const captionForm = document.getElementById('captionFormData');
            
            // access the desired input through the var we setup
            // json stringify should 'clean' it up
            const captionText = captionForm.elements.caption.value;
            
            // perhaps add some caption text checks
            if (!captionText) {
                const type = 'error';
                const icon = 'fa-solid fa-circle-exclamation';
                const title = 'Error';
                const text = 'Caption text was left blank.';
                createToast(type, icon, title, text);
                return;
            }

            // send to add new caption function
            if (await usercaption(captionText)) {
                const type = 'success';
                const icon = 'fa-solid fa-circle-check';
                const title = 'Success';
                const text = 'Caption added successfully!';
                createToast(type, icon, title, text);
                
                console.log('re-run grab captions to see upvote change');
                await collectCaptions(); // re-run caption grab
            } else {
                const type = 'error';
                const icon = 'fa-solid fa-circle-exclamation';
                const title = 'Error';
                const text = 'Server side error. Please try again.';
                createToast(type, icon, title, text);
            }
        });

    }); 
}

/*
This section is for user handling.
Check if user exists then
Grab form data to sign in or register.
*/

// checks for a username/email that already exists
async function signUpCheck(thisUsername, thisEmail) {
    const URL = `${servURL}/checkifexists`;
    const body = {
        username: thisUsername,
        email: thisEmail
    };
    const signUpCheck = await postNoAuth(URL, body); // this will fetch a success or error for signing up
    return (signUpCheck.message === 'Success');
}

// registers a new user
async function signUpRegister(thisUsername, thisEmail, thisPassword) {
    // first check that you can sign up
    const uniqueUser = await signUpCheck(thisUsername, thisEmail);

    if (uniqueUser) {
        const URL = `${servURL}/register`;
        const body = { 
            username: thisUsername, 
            email: thisEmail, 
            password: thisPassword 
        };
        const regCheck = await postNoAuth(URL, body); // this will fetch a success or error for signing up
        return (regCheck.message === 'Success');
    } else {
        // if you can't sign up, then abort
        return false;
    }
}

// create a way to sign in as a regular user
async function signInUser(thisEmail, thisPassword) {
    const URL = `${servURL}/signin`;
    const body = {
        email: thisEmail,
        password: thisPassword
    };
    const signInCheck = await postNoAuth(URL, body); // this will fetch a token
    if (signInCheck.message === 'Failure') {
        // no token was created
        return false;
    } else {
        // a user token was created and should be stored as a session
        sessionStorage.setItem('usertoken', signInCheck.token);
        return true;
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
            
            // access the desired input through the var we setup
            const username = regForm.elements.usernameReg.value;
            const email = regForm.elements.emailReg.value;
            const password = regForm.elements.passwordReg.value;
        
            // redirect user based on signup attempt
            if (await signUpRegister(username, email, password)) {
                const type = 'success';
                const icon = 'fa-solid fa-circle-check';
                const title = 'Success';
                const text = 'You have registered! You will now be directed to the login page.';
                createToast(type, icon, title, text);
                
                setTimeout(() => {
                    window.location.href = `${webURL}/login.html`; // redirect to login
                  }, 1500);
                
            } else {
                const type = 'error';
                const icon = 'fa-solid fa-circle-exclamation';
                const title = 'Error';
                const text = 'Username or email is already registered. Try again or go login.';
                createToast(type, icon, title, text);
            }
        });

    });
} // only runs on the signup page script

if (window.location.href === `${webURL}/login.html`) {

    document.addEventListener('DOMContentLoaded', async function() {
        // set reg and login forms
        const loginForm = document.getElementById('loginFormData');

        // event listeners below
        loginForm.addEventListener('submit', async function() {
            
            event.preventDefault(); // prevents redirection
            const loginForm = document.getElementById('loginFormData');
            
            // access the desired input through the var we setup
            const email = loginForm.elements.email.value;
            const password = loginForm.elements.password.value;
        
            // redirect user based on signup attempt
            if (await signInUser(email, password)) {
                const type = 'success';
                const icon = 'fa-solid fa-circle-check';
                const title = 'Success';
                const text = 'You have logged in! You will be redirected to the main page.';
                createToast(type, icon, title, text);
                
                setTimeout(() => {
                    window.location.href = `${webURL}`; // redirect to main page
                  }, 1500);
                
            } else {
                const type = 'error';
                const icon = 'fa-solid fa-circle-exclamation';
                const title = 'Error';
                const text = 'Username or Password was incorrect.';
                createToast(type, icon, title, text);
            }

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
                <span id='captuser'>
                    <span id='postCaption'>${post.captiontext}</span>
                    <span id='postUser'> - ${post.username} </span>
                </span>
                <div id='postUpvotes'>
                    <span class='heart'> <a onclick="userdownvote(JSON.parse(this.closest('div').getAttribute('data-info')))"><i id='downvoteheart' class="material-symbols-outlined">heart_minus</i></a></span>
                    <span class='votenum'>${post.votecount}</span>
                    <span class='heart'> <a onclick="userupvote(JSON.parse(this.closest('div').getAttribute('data-info')))"><i id='upvoteheart' class="material-symbols-outlined">heart_plus</i></a></span>
                    
                </div>
            `;
            // set attribute data-info
            // escape the JSON string for embedding in HTML
            const customData = {
                captiontext: post.captiontext,
                username: post.username,
            };
            const jsonData = escapeJson(JSON.stringify(customData)); // for custome data-info
            // insert the escaped JSON into the HTML
            // find the postUpvotes element to set the data-info attribute
            const postUpvotesElement = postElement.querySelector('#postUpvotes');
            postUpvotesElement.setAttribute('data-info', jsonData);
            postContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error(error);
    }
}

// Escape function to ensure the JSON string is safe to use inside HTML
function escapeJson(json) {
    return json.replace(/\\/g, '\\\\');
}

// this function upvotes if user is logged in
async function userupvote(dataInfo) {
    
    const captionText = dataInfo.captiontext; // grab from data
    const captionUser = dataInfo.username; // grab from data
    const voteType = 'upvote';
    // set up url and body for post request
    const URL = `${servURL}/votecaption`;
    const body = {
        captiontext: captionText, 
        captionuser: captionUser,
        type: voteType
    }; // body data 
    
    // check for token
    const thistoken = sessionStorage.getItem('usertoken');

    if (!thistoken) {
        console.log('No token found');
        const type = 'error';
        const icon = 'fa-solid fa-circle-exclamation';
        const title = 'Error';
        const text = 'Please login. User not found.';
        createToast(type, icon, title, text);
        return;
    }
    
    // send body and token to server
    const voted = await postAuth(URL, body, thistoken);
    
    if (voted.message === 'Failure') {
        // unable to upvote
        console.log('Unable to upvote');
        const type = 'error';
        const icon = 'fa-solid fa-circle-exclamation';
        const title = 'Error';
        const text = 'Something scewed up on the server side...';
        createToast(type, icon, title, text);
    } else if (voted.message === 'Added') {
        // upvote was added successful
        console.log('upvote was successfully added');
        await collectCaptions();
        const type = 'success';
        const icon = 'fa-solid fa-circle-check';
        const title = 'Success';
        const text = 'Your vote has been counted!!';
        createToast(type, icon, title, text);
    } else if (voted.message === 'Removed') {
        // upvote was removed successfully
        console.log('upvote was rescinded');
        await collectCaptions();
        const type = 'success';
        const icon = 'fa-solid fa-circle-check';
        const title = 'Success';
        const text = 'Your vote was rescinded.';
        createToast(type, icon, title, text);
    }
}

// this function downvotes if user is logged in
async function userdownvote(dataInfo) {
    
    const captionText = dataInfo.captiontext; // grab from data
    const captionUser = dataInfo.username; // grab from data
    const voteType = 'downvote';
    // set up url and body for post request
    const URL = `${servURL}/votecaption`;
    const body = {
        captiontext: captionText, 
        captionuser: captionUser,
        type: voteType
    }; // body data 
    
    // check for token
    const thistoken = sessionStorage.getItem('usertoken');

    if (!thistoken) {
        console.log('No token found');
        const type = 'error';
        const icon = 'fa-solid fa-circle-exclamation';
        const title = 'Error';
        const text = 'Please login. User not found.';
        createToast(type, icon, title, text);
        return;
    }
    
    // send body and token to server
    const voted = await postAuth(URL, body, thistoken);
    
    if (voted.message === 'Failure') {
        // unable to downvote
        console.log('Unable to upvote');
        const type = 'error';
        const icon = 'fa-solid fa-circle-exclamation';
        const title = 'Error';
        const text = 'Something scewed up on the server side...';
        createToast(type, icon, title, text);
    } else if (voted.message === 'Added') {
        // upvote was added successful
        console.log('downvote was successfully added');
        await collectCaptions();
        const type = 'success';
        const icon = 'fa-solid fa-circle-check';
        const title = 'Success';
        const text = 'Your vote has been counted!!';
        createToast(type, icon, title, text);
    } else if (voted.message === 'Removed') {
        // upvote was removed successfully
        console.log('downvote was rescinded');
        await collectCaptions();
        const type = 'success';
        const icon = 'fa-solid fa-circle-check';
        const title = 'Success';
        const text = 'Your vote was rescinded.';
        createToast(type, icon, title, text);
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
    const currentIndex = Number(sessionStorage.getItem('currentIndex'));
    const URL = `${servURL}/collectcaptions?imageid=${currentIndex+1}`;
    const captions = await getDBData(URL);
    
    // display captions
    displayCaptions(captions);
}

/*
This section is for adding captions.
It connects with the image handler.
Only approved captions will be displayed
*/

// this function adds captions if user is logged in
async function usercaption(captionText) {
    
    // grab data for captionText and imageID
    const currentIndex = Number(sessionStorage.getItem('currentIndex'));
    const imageID = currentIndex + 1; // grab from currentIndex
    
    // set up url and body for post request
    const URL = `${servURL}/addnewcaption`;
    const body = {
        captiontext: captionText, 
        imageid: imageID
    }; // body data 
    
    // check for token
    const thistoken = sessionStorage.getItem('usertoken');

    if (!thistoken) {
        console.log('No token found');
        const type = 'error';
        const icon = 'fa-solid fa-circle-exclamation';
        const title = 'Error';
        const text = 'Please login. User not found.';
        createToast(type, icon, title, text);
        return false;
    }
    
    // send body and token to server
    const addedCaption = await postAuth(URL, body, thistoken);
    
    if (addedCaption.message === 'Failure') {
        // unable to upvote
        console.log('Unable to add caption.');
        const type = 'error';
        const icon = 'fa-solid fa-circle-exclamation';
        const title = 'Error';
        const text = 'Something scewed up on the server side...';
        createToast(type, icon, title, text);
        return false;
    } else {
        // upvote was successful
        console.log('adding caption was successful');
        console.log('re-run grab captions to see changes');
        await collectCaptions(); // re-run caption grabber
        const type = 'success';
        const icon = 'fa-solid fa-circle-check';
        const title = 'Success';
        const text = 'Your caption was added!!';
        createToast(type, icon, title, text);
        return true;
    }
}

/*
This section is for toast messages.
These will alert the users of success or error
for various actions on the webpages
*/

function createToast(type, icon, title, text) {
    const notifications = document.querySelector('.notifications');
    const newToast = document.createElement('div');
    newToast.innerHTML = `
        <div class="toast ${type}">
            <i class="${icon}"></i>
            <div class="content">
                <div class="title">${title}</div>
                <span>${text}</span>
            </div>
            <i class="fa-solid fa-xmark" onclick="(this.parentElement).remove()"></i>
        </div>`;
    notifications.appendChild(newToast);
    newToast.timeOut = setTimeout(()=>newToast.remove(), 5000);
}

/* for reference when adjusting type, icon, title and text of toast
success.onclick = function(){
    let type = 'success';
    let icon = 'fa-solid fa-circle-check';
    let title = 'Success';
    let text = 'This is a success toast.';
    createToast(type, icon, title, text);
}
error.onclick = function(){
    let type = 'error';
    let icon = 'fa-solid fa-circle-exclamation';
    let title = 'Error';
    let text = 'This is a error toast.';
    createToast(type, icon, title, text);
}
*/

/*
Window onload for toggling login/non-login features
*/

// function to toggle caption form 

// On page load, update the theme based on session storage
window.onload = function() {
    if (sessionStorage.getItem('usertoken')) {
        let cform = document.getElementById('captionform');
        cform.style.display = 'flex';
        cform = document.getElementById('captionformheader');
        cform.style.display = 'flex';
        cform = document.getElementById('loginChange');
        cform.innerHTML = `<a href="" onclick="signoutUser()">Sign Out</a>`; // change login to sign out

    } else {
        // do nothing
    }
};

// function to delete usertoken and sign out user
function signoutUser() {
    sessionStorage.removeItem('usertoken'); // remove token
    
    const type = 'success';
    const icon = 'fa-solid fa-circle-check';
    const title = 'Success';
    const text = 'You have been signed out.';

    createToast(type, icon, title, text); // display to user

    setTimeout(() => {
        window.location.href = `${webURL}`; // redirect to main page
      }, 1500);
}