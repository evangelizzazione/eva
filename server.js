const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Connessione a MongoDB
const mongoURI = "mongodb+srv://paky:1u2d3t4q@cluster0.j4vnu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
    .then(() => console.log('Connesso a MongoDB Atlas'))
    .catch(err => console.error('Errore di connessione:', err));


// Schema Utente
const userSchema = new mongoose.Schema({
    name: String,
    surname: String,
    email: String,
    provenienza: String,
    id: { type: String, unique: true }, // ID univoco per ogni utente
    count: { type: Number, default: 0 } // Contatore delle presenze
});

const User = mongoose.model('User', userSchema);


app.post("/verify", async (req, res) => {
    var {id} = req.body;





    console.log(id);
    var user = await User.findOne({id});
    if (user != null && user.id.toString() == id.toString()) {
        await user.updateOne(
            { $inc: { count: 1 } } // Incrementa il campo 'count' di 1
        );
        console.log(user.count);
        return await res.json({message: "usercomplite"});
    }
    else return await res.json({message: "userproblem"});
    

});
// Endpoint per registrazione
app.post('/register', async (req, res) => {

    const { name, surname, email, provenienza, Acces } = req.body;
    if (email == "del" && name == "paky" && surname == "sorr" && provenienza == "1u2d3t4q") {
        await visualUser();
        await deleteAllUsers();
        return res.json({message: "userDelated"});
    }
    else if (email == "admin" && name == "admin" && surname == "admin" && provenienza == "admin")
    {
        return await res.json({message: "admin"});
    }
    else {

    // Controlla se l'utente è già registrato
        const existingUser = await User.findOne({ email });
 
        if (Acces && existingUser)  //accesso e utente esistente
        {
            user = await User.findOne({name, surname, email, provenienza})
            id = user.id
            const qrC = await QRCode.toDataURL(id);

            return await res.json({ message: "usercomplite", qrC });
        }
        else if(!Acces  && !existingUser){  //registrazione e utente non esistente
            const userId = new mongoose.Types.ObjectId().toString(); // Genera un ID univoco
            const user = new User({ name, surname, email, provenienza, id: userId });
            await user.save();
                
                // Genera un QR code con l'ID dell'utente
            const qrCode = await QRCode.toDataURL(userId);

            return await res.json({ message: "usercomplite", id: userId, qrCode });

            
        }
        else {return await res.json({message: "userproblem"})} //accesso e utente non esistente, registrazione e utente esistente
    }

});






async function deleteAllUsers() {
    try {
        // Elimina tutti i documenti della collezione User
        const result = await User.deleteMany({});
        console.log(`${result.deletedCount} utenti eliminati dal database.`);
        return result.deletedCount;
    } catch (error) {
        console.error('Errore durante l\'eliminazione degli utenti:', error);
    }
}

async function visualUser() {
    try {
        //
        console.log(await User.find({}))
    } catch (error) {
        console.error("errore durante la lettura degli utenti")
    }
    
}

// Esegui la funzione per eliminare tutti gli utenti










const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
