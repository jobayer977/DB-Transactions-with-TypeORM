import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as express from 'express';

import { Request, Response } from 'express';

import { Balance } from './entities/Balance';
import { DataSource } from 'typeorm';
import { User } from './entities/User';

const app = express();
app.use(bodyParser.json());
const dataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'dev',
	password: 'dev1234',
	database: 'dev_db',
	synchronize: true,
	entities: [User, Balance],
});

app.post('/users', async (req: Request, res: Response) => {
	const queryRunner = dataSource.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();
	try {
		const { name, balance } = req.body;

		const newUser = new User();
		newUser.name = name;

		const savedUser = await queryRunner.manager.save(newUser);
		const newBalance: any = new Balance();
		newBalance.balance = 'balance';
		newBalance.userId = newUser.id;

		await queryRunner.manager.save(newBalance);

		await queryRunner.commitTransaction();
		res.status(201).json(savedUser);
	} catch (error) {
		await queryRunner.rollbackTransaction();
		res.status(500).json({ error: error.message });
	} finally {
		await queryRunner.release();
	}
});

app.get('/users', async (req: Request, res: Response) => {
	const users = await dataSource.getRepository(User).find();
	const balances = await dataSource.getRepository(Balance).find();
	const usersWithBalance = users.map((user) => {
		const balance = balances.find((balance) => balance.userId === user.id);
		return {
			...user,
			balance: {
				id: balance?.id,
				balance: balance?.balance,
			},
		};
	});
	res.json(usersWithBalance);
});
dataSource
	.initialize()
	.then(() => {
		console.log('Data Source has been initialized!');
	})
	.catch((err) => {
		console.error('Error during Data Source initialization', err);
	});

app.listen(3000, () => {
	console.log('Server is listening on port 3000');
});
