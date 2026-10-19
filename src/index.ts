import { ApplicationController } from './controllers/ApplicationController';

const app = new ApplicationController();
app.run().catch(console.error);
