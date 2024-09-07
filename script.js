const trainTypes = [
    { name: '普通', min: 1, max: 100, cost: 2000 },
    { name: '急行', min: 50, max: 200, cost: 5550 },
    { name: '特急', min: 150, max: 300, cost: 10000 },
    { name: '観光特急', min: 1000, max: 1100, cost: 20000 }
];

let money = 10000;  // 初期所持金 1万円
let trains = [];
let routes = [];
const maxRoutes = 5;

// HTML要素の参照
const moneyDisplay = document.getElementById('formatted-money');
const trainList = document.getElementById('train-list');
const routeList = document.getElementById('route-list');
const addRouteButton = document.getElementById('add-route');
const trainTypeSelect = document.getElementById('train-type');

// 両数の上限
const maxCars = 6;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-train').addEventListener('click', addTrain);
    document.getElementById('add-route').addEventListener('click', addRoute);

    loadGameData();
    updateMoney();

    // 1秒ごとに収益を計算して所持金を増加させる
    setInterval(updateIncome, 1000);
});

function addTrain() {
    const name = document.getElementById('train-name').value;
    const cars = parseInt(document.getElementById('train-cars').value, 10);
    const memo = document.getElementById('train-memo').value;
    const trainType = trainTypeSelect.options[trainTypeSelect.selectedIndex].value;
    const additionalCost = parseInt(trainTypeSelect.options[trainTypeSelect.selectedIndex].dataset.cost, 10);

    if (cars < 1 || cars > maxCars) {
        alert(`車両の両数は1～${maxCars}両までです。`);
        return;
    }

    if (money < additionalCost) {
        alert(`選択した種別の追加料金が足りません。必要な金額: ¥${additionalCost}`);
        return;
    }

    // 車両追加時に所持金から追加料金を引く
    money -= additionalCost;
    updateMoney();

    const trainNumber = prompt('車両番号を入力してください (例: 1234A)');

    const newTrain = {
        name,
        cars,
        type: trainType,
        memo,
        trainNumber,
        minIncome: trainTypes.find(type => type.name === trainType).min * cars,
        maxIncome: trainTypes.find(type => type.name === trainType).max * cars
    };

    trains.push(newTrain);
    displayTrains();
    saveGameData();
}

function addRoute() {
    if (money >= 500000 && routes.length < maxRoutes) {
        const newRoute = { income: 0 };
        routes.push(newRoute);
        money -= 500000;
        displayRoutes();
        updateMoney();
        saveGameData();
    }
    updateRouteButtonState();
}

function sellTrain(index) {
    const train = trains[index];
    money += train.minIncome * 10;
    trains.splice(index, 1);
    displayTrains();
    updateMoney();
    saveGameData();
}

function displayTrains() {
    trainList.innerHTML = '';
    trains.forEach((train, index) => {
        const trainDiv = document.createElement('div');
        trainDiv.classList.add('train-item');
        trainDiv.innerHTML = `
            <strong>${train.name} (${train.trainNumber}) - ${train.type} - ${train.cars}両</strong>
            <br>収入: ¥${train.minIncome} ~ ¥${train.maxIncome}/秒
            <br>メモ: ${train.memo}
            <button onclick="sellTrain(${index})">売却</button>
        `;
        trainList.appendChild(trainDiv);
    });
}

function displayRoutes() {
    routeList.innerHTML = '';
    routes.forEach((route, index) => {
        const routeDiv = document.createElement('div');
        routeDiv.classList.add('route-item');
        routeDiv.innerHTML = `<strong>路線 ${index + 1}</strong> - 現在の収入: ¥${route.income}`;
        routeList.appendChild(routeDiv);
    });
}

// 所持金を更新
function updateMoney() {
    const formattedMoney = formatMoney(money);
    moneyDisplay.textContent = formattedMoney;
    saveGameData();
}

// 所持金を万単位でフォーマット
function formatMoney(amount) {
    const man = Math.floor(amount / 10000);
    const yen = amount % 10000;
    return `${man}万${yen.toLocaleString()}円`;
}

// ローカルストレージにゲームデータを保存
function saveGameData() {
    const gameData = {
        money: money,
        trains: trains,
        routes: routes
    };
    localStorage.setItem('trainGameData', JSON.stringify(gameData));
}

// ローカルストレージからゲームデータを読み込み
function loadGameData() {
    const savedData = localStorage.getItem('trainGameData');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        money = gameData.money || 10000;
        trains = gameData.trains || [];
        routes = gameData.routes || [];

        displayTrains();
        displayRoutes();
    }
}

// 1秒ごとに収益を計算して所持金を増加させる関数
function updateIncome() {
    trains.forEach(train => {
        const income = Math.floor(Math.random() * (train.maxIncome - train.minIncome + 1)) + train.minIncome;
        money += income;
    });
    updateMoney();
}
