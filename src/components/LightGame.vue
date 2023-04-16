<template>
    <div class="light-game-area">
        <div class="light-game-wrapper">
            <div class="light-game-row" v-for="(r, i) in gameBoard">
                <div class="light-game-cell" v-for="(c, j) in r" :class="[ c === 1 ? 'light-on' : 'light-off']" @click="clickLight(i, j)"></div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 15px;">
            <button class="btn btn-primary" @click="resetGame">重置</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.light-game-wrapper {
    .light-game-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .light-game-cell {
            background-size: 35px 35px;
            background-repeat: no-repeat;
            background-position: center;
            width: 45px;
            height: 45px;
            transition: all 0.15s ease-in-out;
            cursor: pointer;
            border: 1px solid #ababab;
        }
        .light-on {
            background-image: url('/ccbc12/assets/icon/light_on.png');
            &:hover{
                filter: brightness(0.6);
            }
        }
        .light-off {
            background-image: url('/ccbc12/assets/icon/light_off.png');
            &:hover{
                filter: brightness(1.4);
            }
        }
    }
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';

const gameBoard = ref<number[][]>([]);
const gameInitBoard = ref<number[][]>([]);
async function gameInit(initArr: number[], colLength: number) {
    let tempGameInitBoard = [];
    for (let n of initArr) {
        //convert n to binary, leftpad to colLength, then slice into 0/1 array.
        let binary = (n >>> 0).toString(2);
        let binaryArr = binary.padStart(colLength, "0").split("").map(x => parseInt(x));
        tempGameInitBoard.push(binaryArr);
    }
    gameInitBoard.value = deepClone2DArray(tempGameInitBoard);
    gameBoard.value = tempGameInitBoard;
}
async function resetGame() {
    gameBoard.value = deepClone2DArray(gameInitBoard.value);
}
async function clickLight(i: number, j: number) {
    //get cow, rol number
    let colLength = gameInitBoard.value[0].length;
    let rowLength = gameInitBoard.value.length;

    //invert gameBoard(i, j)
    let tempGameBoard = gameBoard.value;
    tempGameBoard[i][j] = tempGameBoard[i][j] === 1 ? 0 : 1;
    if (i - 1 >= 0) {
        tempGameBoard[i - 1][j] = tempGameBoard[i - 1][j] === 1 ? 0 : 1;
    }
    if (i + 1 < rowLength) {
        tempGameBoard[i + 1][j] = tempGameBoard[i + 1][j] === 1 ? 0 : 1;
    }
    if (j - 1 >= 0) {
        tempGameBoard[i][j - 1] = tempGameBoard[i][j - 1] === 1 ? 0 : 1;
    }
    if (j + 1 < colLength) {
        tempGameBoard[i][j + 1] = tempGameBoard[i][j + 1] === 1 ? 0 : 1;
    }
    gameBoard.value = tempGameBoard;
}

function deepClone2DArray(arr: number[][]): number[][] {
    let tempArr = [];
    for (let r of arr) {
        tempArr.push(r.slice());
    }
    return tempArr;
}

(window as any)["lightGameInit"] = gameInit;
</script>