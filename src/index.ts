import express, {Request, Response} from "express";
import mysql from "mysql2/promise";

const app = express();

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));

app.get('/categories', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM categories");
    return res.render('categories/index', {
        categories: rows
    });
});

app.get("/categories/form", async function (req: Request, res: Response) {
    return res.render("categories/form");
});

app.post("/categories/save", async function(req: Request, res: Response) {
    const body = req.body;
    const insertQuery = "INSERT INTO categories (name) VALUES (?)";
    await connection.query(insertQuery, [body.name]);

    res.redirect("/categories");
});

app.post("/categories/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
});

app.get('/users', async function (req: Request, res: Response): Promise<void> {
    const [users] = await connection.query<any[]>("SELECT * FROM users");
    return res.render('users/index', {
        users: users
    });
});

app.get('/users/add', function (req: Request, res: Response): void {
    res.render('users/add');
});

app.post('/users', async function (req: Request, res: Response): Promise<void> {
    const { name, email, password, role, active } = req.body;
    
    const insertQuery = "INSERT INTO users (name, email, password, role, active) VALUES (?, ?, ?, ?, ?)";
    await connection.query(insertQuery, [name, email, password, role, active ? 1 : 0]); // Converte `active` para 0 ou 1

    res.redirect('/users');
});

app.get('/login', function (req: Request, res: Response): void {
    res.render('login');
});

app.post('/users/:id/delete', async function (req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const deleteQuery = "DELETE FROM users WHERE id = ?";
    await connection.query(deleteQuery, [id]);

    res.redirect('/users');
});


app.post('/login', async function (req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    
    const [user] = await connection.query<any[]>("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

    if (user.length === 0) {
        res.redirect('/login');
    } else {
        res.redirect('/users');
    }
});


app.listen('3000', () => console.log("Server is listening on port 3000"));