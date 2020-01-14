const $canvas = document.querySelector(".js-canvas")
const context = $canvas.getContext('2d')

$canvas.width = 400
$canvas.height = 600

const PLAYER_HEIGHT = 50

let game = null
let requestId = null

class Player {
    constructor(x, y){
        this.x = x
        this.y = y
        this.y_velocity = 4

        this._keyboardHandling()
    }

    _keyboardHandling(){
        document.addEventListener("keydown", (_event) => {
            // Everytime we press a key, it jumps

            this.y_velocity -= 12
        })
    }

    _updatePosition(){
        this.y += this.y_velocity
        if(this.y_velocity < 0) this.y_velocity++

        // if(this.y_velocity < 0){
        //     this.y_velocity *= 0.9
        // }
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
        context.fillStyle = `#F00`
        context.shadowBlur = 0

        context.beginPath()
        context.moveTo(this.x, this.y)
        context.arc(this.x, this.y, 20, 0, Math.PI * 2)
        context.fill()
        context.closePath()
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
        this.elapsed = 0
        this.score = 0
        this.columns = [new Column($canvas.width, 50, 50)]
        this.player = new Player(PLAYER_HEIGHT, $canvas.height / 2)

        this.spaceBetweenColumns = 3

        const bestScore = localStorage.getItem('@bally-bird/score')
        this.bestScore = bestScore ? bestScore : 0
    }

    isPlayerCollidingWith(column){
        if(this.player.x < column.x + column.w - PLAYER_HEIGHT &&
            this.player.x + PLAYER_HEIGHT > column.x &&
            ((this.player.y < column.h + column.y &&
            this.player.y + PLAYER_HEIGHT > column.y) || 
            this.player.y < column.subY + column.subH &&
            this.player.y + PLAYER_HEIGHT > column.subY)
        ) {
            this.endGame()
            return true
        }
        return false
    }

    endGame(){
        window.cancelAnimationFrame(requestId)

        if(this.score > this.bestScore){
            this.bestScore = this.score
            localStorage.setItem('@bally-bird/score', this.bestScore)
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
        context.clearRect(0, 0, $canvas.width, $canvas.height)

        this.player.draw()

        for(const column of this.columns.filter($0 => !$0.hasBeenUnrendered)){
            this.isPlayerCollidingWith(column)

            if(column.x < $canvas.width / this.spaceBetweenColumns && !column.hasGivenItsChild){
                column.hasGivenItsChild = true
                this.columns.push(new Column($canvas.width, Math.random() * $canvas.height - 100, Math.random() * 20 + 50))
            }
            if(column.x < -column.w){
                column.hasBeenUnrendered = true
                this.score++
            }else{
                column.draw()
            }
        }
        this.drawScore() // draw score above all elements
    }
}

const startGame = () => {
    game = new Game()
    game.loop()
}

startGame()

document.addEventListener("keydown", (_event) => {
    if(_event.key.toLowerCase() == "r"){
        game.endGame()
        game = new Game()
        game.loop()
    }
})
