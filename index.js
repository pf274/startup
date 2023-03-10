import database from "./database.js";
const {users, games} = database;

function generateCode() {
    return ((36 ** 3) + Math.floor(Math.random() * (34 * 36**3 + 35 * 36**2 + 35 * 36 + 35))).toString(36).toUpperCase();
}

// initialization
$(document).ready(function () {
    let loggedIn = false;
    localStorage.removeItem('game');
    if (localStorage.getItem("user_data")) {
        let user_data = JSON.parse(localStorage.getItem("user_data"));
        if (user_data?.username in users) {
            if (users[user_data?.username]?.password == user_data?.password) {
                loggedIn = true;
            }
        }
    }
    if (loggedIn) {
        let user_data = JSON.parse(localStorage.getItem("user_data"));
        $('.loggedIn').css("display", "block");
        $('.noCredentials').css("display", "none");
        let lobbyTitle = document.getElementById("LobbyTitle");
        lobbyTitle.innerText = `Welcome, ${user_data?.username}!`;
    } else {
        $('.loggedIn').css("display", "none");
        $('.noCredentials').css("display", "block");
    }
});


// Start entering credentials
let startCredentialsButton = document.getElementById("startCredentialsButton");
startCredentialsButton.addEventListener('click', () => {
    let fields = [];
    fields.push(document.getElementById("LoginUsernameField"));
    fields.push(document.getElementById("LoginPasswordField"));
    fields.push(document.getElementById("SignupUsernameField"));
    fields.push(document.getElementById("SignupPasswordField"));
    fields.push(document.getElementById("SignupReenterPasswordField"));
    fields.forEach((field) => {
        field.value = "";
    });
    $("#loginCredentialsAlert").hide();
    $("#signupCredentialsAlert").hide();
})

// logging in
let loginButton = document.getElementById("LoginSubmitButton");
loginButton.addEventListener('click', () => {
    let usernameField = document.getElementById("LoginUsernameField");
    let passwordField = document.getElementById("LoginPasswordField");

    let username = usernameField.value;
    let password = passwordField.value;

    if (username in users) {
        if (users[username]?.password === password) {
             // console.log("Login Successful!");
            localStorage.setItem("user_data", JSON.stringify(users[username]));
            $('#loginModal').modal('hide');
            $('.loggedIn').css("display", "block");
            $('.noCredentials').css("display", "none");
            let lobbyTitle = document.getElementById("LobbyTitle");
            lobbyTitle.innerText = `Welcome, ${username}!`;
            $("#loginCredentialsAlert").hide();
        } else {
             // console.log("Invalid Password, scrub!");
            let alert = document.getElementById('loginCredentialsAlert');
            alert.innerHTML = "Invalid password. Please try again.";
            $("#loginCredentialsAlert").show();
        }
    } else {
         // console.log("unrecognized user!");
        let alert = document.getElementById('loginCredentialsAlert');
        alert.innerHTML = "Invalid username. Please try again.";
        $("#loginCredentialsAlert").show();
    }
});

// signing up
let signupButton = document.getElementById("SignupSubmitButton");
signupButton.addEventListener('click', () => {
    let usernameField = document.getElementById("SignupUsernameField");
    let passwordField = document.getElementById("SignupPasswordField");
    let reenterPasswordField = document.getElementById("SignupReenterPasswordField");

    let username = usernameField.value;
    let password = passwordField.value;
    let reenteredPassword = reenterPasswordField.value;

    if (!(username in users)) {
        if (password.length > 0) {
            if (password === reenteredPassword) {
                users[username] = {
                    username: username,
                    password: password,
                };
                 // console.log("Signup successful!");
                $("#signupModal").modal("hide");
                $("#loginModal").modal("show");
                $("#signupCredentialsAlert").hide();
            } else {
                 // console.log("Passwords do not match!");
                let alert = document.getElementById('signupCredentialsAlert');
                alert.innerHTML = "Passwords do not match. Please try again.";
                $("#signupCredentialsAlert").show();
            }
        } else {
            let alert = document.getElementById('signupCredentialsAlert');
            alert.innerHTML = "Please provide a password.";
            $("#signupCredentialsAlert").show();
        }

    } else {
         // console.log("User already exists!");
        let alert = document.getElementById('signupCredentialsAlert');
        alert.innerHTML = "Username already in use. Please try again.";
        $("#signupCredentialsAlert").show();
    }
})

// logging out
let logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener('click', () => {
    localStorage.removeItem("user_data");
    $('.loggedIn').css("display", "none");
    $('.noCredentials').css("display", "block");
});

// Joining a game
let joinGameButton = document.getElementById("joinGameButton");
joinGameButton.addEventListener('click', () => {
    let gameCodeField = document.getElementById("joinGameCodeField");

    let gameCode = gameCodeField.value;
    let alert = document.getElementById('joinGameAlert');
    alert.innerHTML = "Joining unavaliable until networking is programmed.";
    $("#joinGameAlert").show();
    if (gameCode in games) {
         console.log("Join Game Successful!");
    } else {
         console.log("Invalid game code!");
    }
})



// Hosting a game
let hostGameModalButton = document.getElementById("hostGameModalButton");
hostGameModalButton.addEventListener('click', () => {
    let generatedCodeElement = document.getElementById("generatedCode");
    let generatedCode = generateCode(); // Generates a random game code four characters long, using chars 0-9 and A-Z.
    while (generatedCode in games) {
        generatedCode = generateCode();
    }
    let username = JSON.parse(localStorage.getItem("user_data")).username
    games[generatedCode] = {
        game_code: generatedCode,
        host: username,
        participants: {
            [username]: {},
        }, // allow for three more participants maximum
        game_type: "hosted",
    }
    generatedCodeElement.innerText = generatedCode;
});

// start hosted game
let startHostedGameButton = document.getElementById("startHostedGameButton");
startHostedGameButton.addEventListener('click', () => {
    let generatedCodeElement = document.getElementById("generatedCode");
    localStorage.setItem("game", JSON.stringify(games[generatedCodeElement.innerText]));
    // TODO: Tell other players' webpages to start game.
    window.location.href = "./Pages/PartyDraw/draw.html";
});

// start free draw
let freeDrawButton = document.getElementById("freeDrawButton");
freeDrawButton.addEventListener('click', () => {
    let generatedCode = generateCode(); // Generates a random game code four characters long, using chars 0-9 and A-Z.
    let username = JSON.parse(localStorage.getItem("user_data")).username;
    let local_game = {
        game_code: generatedCode,
        host: username,
        participants: {
            [username]: {},
        },
        game_type: "local",
    }
    localStorage.setItem("game", JSON.stringify(local_game));
    window.location.href = "./Pages/FreeDraw/draw.html";
});