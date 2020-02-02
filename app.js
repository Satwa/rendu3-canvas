const $canvas = document.querySelector(".js-canvas")
const context = $canvas.getContext('2d')
const playerImage = document.createElement('img')

$canvas.width = 400
$canvas.height = 600

if(window.screen.width < 400 || window.screen.height < 600){
    $canvas.width = window.screen.width
    $canvas.height = window.screen.height
}

const PLAYER_HEIGHT = 50

let game = null
let requestId = null
let fps
let fpsInterval
let startTime
let now
let then
let elapsed

class Player {
    constructor(x, y){
        this.x = x
        this.y = y
        this.isDead = false
        this.y_velocity = 4

        this._keyboardHandling()
    }

    _keyboardHandling(){
        document.addEventListener("mousedown", (_event) => {

            this.y_velocity -= 14
        })
        
        document.addEventListener("keydown", (_event) => {
            // Everytime we press a key, it jumps

            this.y_velocity -= 14
        })
        
        document.addEventListener("touchstart", (_event) => {
            this.y_velocity -= 14
        })
    }

    _updatePosition(){
        this.y += this.y_velocity
        if(this.y_velocity < 0) this.y_velocity++

        if(Math.floor(this.y_velocity) < 1 && Math.floor(this.y_velocity) > -1){
            this.y_velocity += 4
        }

        // Automatically stay in the frame
        if(this.y < -PLAYER_HEIGHT){
            this.y = $canvas.height + PLAYER_HEIGHT
        }else if(this.y > $canvas.height + PLAYER_HEIGHT){
            this.y = -PLAYER_HEIGHT
        }
    }

    draw() {
        this._updatePosition()
        // context.fillStyle = `#F00`
        context.shadowBlur = 0
        context.drawImage(playerImage, this.x, this.y)
    }
}

class Column{
    constructor(x, h, w){
        this.x = x
        this.y = 0
        this.h = h
        this.w = w
        this.subY = this.h + PLAYER_HEIGHT * 4
        this.subH = $canvas.height - this.h - PLAYER_HEIGHT * 4
        this.hue = Math.floor(Math.random() * 360)
        this.hasBeenUnrendered = false
        this.hasGivenItsChild = false
    }

    draw(){
        this.x -= 5

        context.fillStyle = `hsl(${this.hue}deg, 80%, 50%)`

        context.shadowOffsetX = 0
        context.shadowOffsetY = 0
        context.shadowBlur = 20
        context.shadowColor = `hsl(${this.hue}deg, 100%, 30%)`

        // context.fillRect(x, y, w, h)
        context.fillRect(this.x, 0, this.w, this.h)
        context.fillRect(this.x, this.subY, this.w, this.subH)
    }
}

class Game{
    constructor(){
        this.score = 0
        this.columns = [new Column($canvas.width, 50, 50)]
        this.player = new Player(PLAYER_HEIGHT, $canvas.height / 2)

        this.spaceBetweenColumns = 3

        const bestScore = localStorage.getItem('@flappy-fish/score')
        this.bestScore = bestScore ? bestScore : 0
    }

    isPlayerCollidingWith(column){
        if(this.player.x < column.x + column.w - PLAYER_HEIGHT / 1.1 &&
            this.player.x + PLAYER_HEIGHT / 1.1 > column.x &&
            ((this.player.y < column.h + column.y &&
            this.player.y + PLAYER_HEIGHT / 1.1 > column.y) || 
            this.player.y < column.subY + column.subH + 20 &&
            this.player.y + PLAYER_HEIGHT / 1.1 > column.subY)
        ) {
            this.player.isDead = true
            this.endGame()
            return true
        }
        return false
    }

    endGame(){
        window.cancelAnimationFrame(requestId)

        context.font = "20px Helvetica"
        context.fillStyle = "#FFF"

        context.fillText(`GAME OVER`, $canvas.width / 2 - 20, $canvas.height / 2)
        context.fillText(`Press R to restart`, $canvas.width / 2 - 30, $canvas.height / 2 + 30)

        if(this.score > this.bestScore){
            this.bestScore = this.score
            localStorage.setItem('@flappy-fish/score', this.bestScore)
        }
    }

    drawScore(){
        context.font = "20px Helvetica"
        context.fillStyle = "#FFF"
        context.fillText(`Score: ${this.score}`, 50, 20)

        context.fillText(`Best score: ${this.bestScore}`, $canvas.width - 150, 20)
    }

    loop(){
        requestId = window.requestAnimationFrame(this.loop.bind(this))

        now = Date.now()
        elapsed = now - then

        // source: https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
        if(elapsed < fpsInterval) {
            return
        }
        then = now - (elapsed % fpsInterval)

        context.clearRect(0, 0, $canvas.width, $canvas.height)

        this.player.draw()

        for(const column of this.columns.filter($0 => !$0.hasBeenUnrendered)){ // iterate into still-visible columns
            this.isPlayerCollidingWith(column)

            if(column.x < $canvas.width / this.spaceBetweenColumns && !column.hasGivenItsChild){
                column.hasGivenItsChild = true
                this.columns.push(new Column($canvas.width, Math.random() * $canvas.height - 100, Math.random() * 20 + 50))
            }
            if(column.x < -column.w){ // if column is being hidden from canvas, stop rendering it
                column.hasBeenUnrendered = true
                this.score++
            }else{
                column.draw()
            }
        }
        this.drawScore() // draw score above all elements
    }
}


const loadScreen = () => {
    // requestId = window.requestAnimationFrame(loadScreen)
    context.clearRect(0, 0, $canvas.width, $canvas.height)

    context.font = "20px Helvetica"
    context.fillStyle = "#FFF"
    context.fillText(`FLAPPY FISH`, $canvas.width / 2 - 75, 20)
    
    context.font = "12px Helvetica"
    context.fillStyle = "#FFF"
    context.fillText(`Press any key to jump`, $canvas.width / 2 - 70, 60)
    context.fillText(`You can cross up/down border`, $canvas.width / 2 - 90, 80)

    context.fillStyle = "#F00"
    context.fillRect($canvas.width / 2 - 150, $canvas.height / 2, 300, 100)
    context.font = "20px Helvetica"
    context.fillStyle = "#FFF"
    context.fillText(`START`, $canvas.width / 2 - 32, $canvas.height / 2 + 60)

    window.addEventListener("mousemove", (_event) => {
        if(game !== null) return
        const rect = {
            x: $canvas.width / 2 - 150,
            y: $canvas.height / 2,
            width: 300,
            height: 100
        }
        const pos = {
            x: _event.clientX - $canvas.offsetLeft,
            y: _event.clientY - $canvas.offsetTop
        }
        if(pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y){
            context.fillStyle = "#3F6"
        }else{
            context.fillStyle = "#F00"
        }
        context.fillRect($canvas.width / 2 - 150, $canvas.height / 2, 300, 100)
        context.font = "20px Helvetica"
        context.fillStyle = "#FFF"
        context.fillText(`START`, $canvas.width / 2 - 32, $canvas.height / 2 + 60)
    })

    const _clickStartButton = (_event) => {
        if(game !== null) return
        const rect = {
            x: $canvas.width / 2 - 150,
            y: $canvas.height / 2,
            width: 300,
            height: 100
        }
        const pos = {
            x: _event.clientX - $canvas.offsetLeft,
            y: _event.clientY - $canvas.offsetTop
        }
        if(pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y) {
            startGame()
        }
    }

    window.addEventListener("mousedown", _clickStartButton)
    window.addEventListener("touchstart", _clickStartButton)


}

const startGame = () => {
    fpsInterval = 1000 / 60
    then = Date.now()
    startTime = then

    game = new Game()
    game.loop()
}


playerImage.addEventListener("load", () => {
    if(window.screen.width > 400){
        loadScreen()
    } else {
        game = new Game()
        game.loop()
    }
})

playerImage.src = "flappyfish.png"

document.addEventListener("keydown", (_event) => {
    if(_event.key.toLowerCase() == "r"){
        game.endGame()
        game = new Game()
        game.loop()
    }
})
document.addEventListener("touchstart", (_event) => {
    if(game.player.isDead){
        game.endGame()
        game = new Game()
        game.loop()
    }
})