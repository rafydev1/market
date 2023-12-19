const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
app.use(cors());
app.use(express.json());
const sequelize = new Sequelize('shop', 'root', '', {
	host: 'localhost',
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},
	logging: false
});

sequelize.define('users', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	nume: {
		type: DataTypes.STRING,
		allowNull: false
	},
	prenume: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	},
	userToken: {
		type: DataTypes.STRING,
		allowNull: true
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false
	}
});

sequelize.define('shopping_cart', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: true
	},
	product_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	product_name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	price: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	status: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	},
	size: {
		type: DataTypes.STRING,
		allowNull: true
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false
	}
});

sequelize.define('products', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	price: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	imageSrc: {
		type: DataTypes.STRING,
		allowNull: false
	},
	stock: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false
	},
	stock_clothes: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: `0|0|0|0`
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false
	}
});
sequelize.sync()
	.then(() => {
		console.log('Database and tables synced');
	})
	.catch((err: string) => {
		console.error('Error syncing database:', err);
	});


app.post('/register', async (req: any, res: any) => {
	try {
		const { email, nume, prenume, password } = req.body;
		const existingUser = await sequelize.models.users.findOne({
			where: {
				email: email,
			},
		});

		if (existingUser) {
			return res.status(400).json({ error: 'Email-ul este deja înregistrat.' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await sequelize.models.users.create({
			email: email,
			nume: nume,
			prenume: prenume,
			password: hashedPassword,
		});

		res.json(newUser);
	} catch (err: any) {
		console.error(err);


		if (err.name === 'SequelizeValidationError') {
			res.status(400).json({ error: 'Validation error. Check your input data.' });
		} else {
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}
});

app.post('/login', async (req: any, res: any) => {
	const { email, password } = req.body;
	try {
		const user = await sequelize.models.users.findOne({
			where: {
				email: email
			}
		});

		if (user) {
			const isMatch = await bcrypt.compare(password, user.password);

			if (isMatch) {
				return res.json({
					message: 'LoginSuccessful',
					email: user.email,
					id: user.id
				});
			} else {
				return res.json({ message: 'Invalid Credentials' });
			}
		} else {
			return res.json({ message: 'User not found' });
		}
	} catch (err) {
		console.error(err);
		return res.json({ message: 'Database error' });
	}
});

app.post('/token', async (req: any, res: any) => {
	try {
		const { token, email } = req.body;

		const [result] = await sequelize.models.users.update(
			{ userToken: token },
			{
				where: { email: email },
				returning: true,
			}
		);

		if (result) {
			res.json({
				message: 'Success',
			});
		} else {
			res.json({ message: 'Unsuccess' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Database error' });
	}
});

app.post('/authcheck', async (req: any, res: any) => {
	const { email, token } = req.body;

	try {
		const account = await sequelize.models.users.findOne({
			attributes: ['userToken'],
			where: {
				email: email
			}
		});

		if (account) {
			const accountToken = account.userToken;

			if (token === accountToken) {
				return res.json({
					message: 'ValidToken',
					token: accountToken
				});
			} else {
				return res.json({ message: 'InvalidToken' });
			}
		} else {
			return res.json({ message: 'InvalidGetToken' });
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Database error' });
	}
});


app.get(`/getUserData`, async (req: any, res: any) => {
	const { email } = req.query;
	try {
		if (!email) {
			return res.status(400).json({ message: 'Parametrul de query "email" este necesar.' });
		}

		const userAttributes = Object.keys(sequelize.models.users.rawAttributes);

		const userData = await sequelize.models.users.findAll({
			attributes: userAttributes,
			where: {
				email: email,
			},
		});

		if (!userData || userData.length === 0) {
			return res.status(404).json({ message: 'Nu s-au găsit date pentru utilizatorul cu adresa de email specificată.' });
		}

		res.json(userData);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Database error' });
	}
});


app.post('/uplaodProduct', async (req: any, res: any) => {
	const { id, nume, pret, email, size } = req.body;
	try {
		await sequelize.models.shopping_cart.create({
			product_id: id,
			product_name: nume,
			email: email,
			price: pret,
			size: size,
		});
		res.json({ message: 'Success' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/getShoppingCart', async (req: any, res: any) => {
	const { email } = req.query;
	try {
		const products = await sequelize.models.shopping_cart.findAll({
			where: {
				email: email,
				status: true
			}
		});
		res.json(products);
	} catch (err) {
		console.error(err);
		res.json({ message: 'Error' });
	}
});

app.get('/getAllProducts', async (req: any, res: any) => {
	try {
		const products = await sequelize.models.products.findAll();
		res.json(products);
	} catch (err) {
		console.error(err);
		res.json({ message: 'Error' });
	}
});

app.post('/deleteProduct', (req: any, res: any) => {
	const { email, id } = req.body;
	try {
		sequelize.models.shopping_cart.update(
			{ status: false },
			{ where: { email: email, id: id } }
		);
		res.json({ message: 'Success' });
	} catch (err) {
		console.error(err);
		res.json({ message: 'Error' });
	}
});


app.listen(8080, () => {
	console.log('Server is running on port 8080');
});