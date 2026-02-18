// ===== SDK HOOKS (For Platforms) =====
function showInterstitialAd(){}
function showRewardedAd(){}

// ===== VARIABLES =====
let currentQuestion = 0;
let score = 0;
let coins = localStorage.getItem("coins") ? parseInt(localStorage.getItem("coins")) : 0;
let timer;
let timeLeft = 15;
let selected = null;
let player = "";
let soundOn = true;

document.getElementById("coins").innerText = coins;

// ===== QUESTIONS =====
let quiz = [];
for(let i=1;i<=200;i++){
    quiz.push({
        question:"Sample Question " + i,
        options:["Option A","Option B","Option C","Option D"],
        answer:"Option A"
    });
}

// ===== UTIL =====
function switchScreen(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function startGame(){
    player = document.getElementById("playerName").value;
    if(player.trim()==="") return alert("Enter name");
    switchScreen("categoryScreen");
}

function selectCategory(cat){
    switchScreen("gameScreen");
    loadQuestion();
}

function loadQuestion(){
    selected=null;
    timeLeft=15;
    updateProgress();

    startTimer();

    let q = quiz[Math.floor(Math.random()*quiz.length)];
    document.getElementById("question").innerText=q.question;

    let optionsHTML="";
    q.options.forEach(opt=>{
        optionsHTML+=`<div class="option" onclick="selectOption(this,'${opt}')">${opt}</div>`;
    });
    document.getElementById("options").innerHTML=optionsHTML;
}

function selectOption(el,answer){
    document.querySelectorAll(".option").forEach(o=>o.style.background="#eee");
    el.style.background="#bde0ff";
    selected=answer;
}

function startTimer(){
    clearInterval(timer);
    timer=setInterval(()=>{
        timeLeft--;
        document.getElementById("timer").innerText=timeLeft;
        if(timeLeft<=0){
            clearInterval(timer);
            nextQuestion();
        }
    },1000);
}

function nextQuestion(){
    clearInterval(timer);
    if(selected==="Option A"){
        score++;
        coins+=10;
        localStorage.setItem("coins",coins);
    }

    currentQuestion++;
    if(currentQuestion>=10){
        endGame();
    }else{
        loadQuestion();
    }
}

function updateProgress(){
    document.getElementById("progress").style.width = (currentQuestion*10)+"%";
}

function endGame(){
    saveLeaderboard();
    document.getElementById("finalScore").innerText=
        player + ", your score: " + score;

    showInterstitialAd();
    switchScreen("resultScreen");
}

function restartGame(){
    currentQuestion=0;
    score=0;
    switchScreen("startScreen");
}

function saveLeaderboard(){
    let lb=JSON.parse(localStorage.getItem("leaderboard"))||[];
    lb.push({name:player,score:score});
    lb.sort((a,b)=>b.score-a.score);
    lb=lb.slice(0,10);
    localStorage.setItem("leaderboard",JSON.stringify(lb));
}

function showLeaderboard(){
    let lb=JSON.parse(localStorage.getItem("leaderboard"))||[];
    let html="";
    lb.forEach((e,i)=>{
        html+=`<p>${i+1}. ${e.name} - ${e.score}</p>`;
    });
    document.getElementById("leaderboardList").innerHTML=html;
    switchScreen("leaderboardScreen");
}

function goHome(){
    switchScreen("startScreen");
}

function toggleSound(){
    soundOn=!soundOn;
}
