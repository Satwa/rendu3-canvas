// TODO: Créer une classe Game
// TODO: Collision
// TODO: Rythme
// TODO: Gravité
// TODO: Bonus immunité par ex.
// TODO: Score


const $canvas = document.querySelector(".js-canvas")
const context = $canvas.getContext('2d')

$canvas.width = 400
$canvas.height = 600

let requestId = null

let balls = []

const PLAYER_HEIGHT = 50

class Ball {
    constructor(x, y, radius){
        this.x = x
        this.y = y
        this.radius = radius

        this.color = [0, 60, 120, 180, 240, 300][Math.floor(Math.random() * 6)] // pick random color from hue
    }

    draw(){
        context.fillStyle = `hsl(${this.hue}deg, 80%, 50%)`

        context.shadowOffsetX = 0
        context.shadowOffsetY = 0
        context.shadowBlur = 20
        context.shadowColor = `hsl(${this.hue}deg, 100%, 30%)`

        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        context.closePath()
    }
}

class Player {
    constructor(x, y){
        this.x = x
        this.y = y
        this.y_velocity = 4

        // TODO: Draw shape of a bird
        // TODO: Keyboard handling
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
        this.h = h
        this.w = w
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

        context.fillRect(this.x, 0, this.w, this.h)
        context.fillRect(this.x, this.h + PLAYER_HEIGHT * 4, this.w, $canvas.height - this.h - PLAYER_HEIGHT * 4)
    }
}

class Game{
    constructor(){
        this.elapsed = 0
        this.score = 0
        this.columns = [new Column($canvas.width, 50, 50)]
        this.player = new Player(PLAYER_HEIGHT, $canvas.height / 2)

        this.spaceBetweenColumns = 3
    }

    loop(){
        requestId = window.requestAnimationFrame(this.loop.bind(this))
        context.clearRect(0, 0, $canvas.width, $canvas.height)

        this.player.draw()
     
        for(const column of this.columns.filter($0 => !$0.hasBeenUnrendered)){
            if(column.x < $canvas.width / this.spaceBetweenColumns && !column.hasGivenItsChild){
                column.hasGivenItsChild = true
                this.columns.push(new Column($canvas.width, Math.random() * $canvas.height - 100, Math.random() * 20 + 50))
            }
            if(column.x < -column.w){
                column.hasBeenUnrendered = true                
            }else{
                column.draw()
            }
        }

    }
}

let game = new Game()
game.loop() // TODO: Loadscreen + Deathscreen



/*
PREVIOUS GAME CONCEPT
let player = {
    x: 50,
    y: $canvas.height / 2 - 29,
    y_velocity: 0,
    h: 30,
    w: 30,
    hue: 180,
    isJumping: false,
}
let platforms = [{
    x: 20,
    y: $canvas.height / 2,
    w: $canvas.height,
    h: 200,
    hue: Math.floor(Math.random() * 360),
    alreadyGeneratedChild: false,
    distanceBetweenSelfAndNextPlatform: Math.floor(Math.random() * 60 + 40)
}] // Initial platform
let currentPlatformCollisionned = null

const generatePlatform = () => {
    platforms.push({
        x: $canvas.width,
        y: Math.floor(Math.random() * 200 + 200),
        w: Math.floor(Math.random() * 200 + 400),
        h: 200,
        hue: Math.floor(Math.random() * 360),
        alreadyGeneratedChild: false,
        distanceBetweenSelfAndNextPlatform: Math.floor(Math.random() * 60 + 40)
    })

    drawPlatform(platforms[platforms.length - 1])
}

const drawPlatform = (platform) => {
    context.fillStyle = `hsl(${platform.hue}deg, 80%, 50%)`

    context.shadowOffsetX = 0
    context.shadowOffsetY = 0
    context.shadowBlur = 20
    context.shadowColor = `hsl(${platform.hue}deg, 100%, 30%)`

    context.fillRect(platform.x, platform.y, platform.w, platform.h)
}

const drawPlayer = () => {
    context.fillStyle = `hsl(${player.hue}deg, 80%, 50%)`

    context.shadowOffsetX = 0
    context.shadowOffsetY = 0
    context.shadowBlur = 20
    context.shadowColor = `hsl(${player.hue}deg, 100%, 30%)`


    // Handle jump move
    if(player.y_velocity !== 0){
        player.y_velocity += 1.5
        if(player.y > currentPlatformCollisionned.h + currentPlatformCollisionned.y - 1 && isPlayerColliding() && player.isJumping){ // Player below top of platform
            player.isJumping = false
            player.y_velocity = 0
            player.y = currentPlatformCollisionned.h + currentPlatformCollisionned.y - 1
        }
    }

    // Handle falling
    if(!isPlayerColliding() && !player.isJumping){
        player.y_velocity += 5

        // TODO: handle replay when player outside screen
    }

    player.y += player.y_velocity
    player.y_velocity *= 0.9

    context.fillRect(player.x, player.y, player.w, player.h)
}


const isPlayerColliding = () => {
    let collision = false

    for(const platform of platforms){
        if (player.x < platform.x + platform.w &&
            player.x + player.w > platform.x &&
            player.y < platform.y + platform.h &&
            player.y + player.h > platform.y
        ){
            // TODO: Side collision should fail
            currentPlatformCollisionned = platform
            collision = true
            break        
        }
    }

    return collision
}

const playerHandler = () => {
    window.addEventListener("keydown", (_event) => {
        if(_event.key == "ArrowUp"){
            console.log("up!")
            if(isPlayerColliding()){
                player.y_velocity -= 40
                player.isJumping = true
            }
        }
    })   
}



const loop = () => {
    requestId = window.requestAnimationFrame(loop)

    context.clearRect(0, 0, $canvas.width, $canvas.height)
    
    drawPlayer()

    for(const platform of platforms){
        platform.x -= 5
        
        if(platform.x + platform.w >= 0){ // Only draw when platform is visible
            drawPlatform(platform)
        }
        
        if(platform.x + platform.w + platform.distanceBetweenSelfAndNextPlatform < $canvas.width && !platform.alreadyGeneratedChild){ // Generate a new platform
            platform.alreadyGeneratedChild = true
            generatePlatform()
            // window.cancelAnimationFrame(requestId)
        }
    }
}
playerHandler()
loop()
*/