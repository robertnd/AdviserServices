import app from "./app"
import config from "./app/config"

async function serverMain() {
    app.listen(config.port, () => {
        console.log(`Server running on port: ${config.port}`)
    })
}

serverMain().then( () => {
    console.log('serverMain')
}).catch(error => console.log(error))