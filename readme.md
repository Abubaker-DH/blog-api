This project is a backend for Blog app,

Setup:
Make sure to follow all these steps exactly as explained below. Do not miss any steps or you won't be able to run this application.

Install MongoDB
To run this project, you need to install the latest version of MongoDB Community Edition first.

https://docs.mongodb.com/manual/installation/

Once you install MongoDB, make sure it's running.

Install the Dependencies
Next, from the project folder, install the dependencies:

npm i

You need to add .env file in the root of project with key=> value
I've set a default value here to make it easier for you to get up and running with this project.
you should store this keys as an environment variable.

PORT=5000
JWT_EXPIRE=30d
JWT_SECRIT=qweqwdlij55wq2ds53f5fa35fa335af53  
MONGO_URI=mongodb://localhost/blogDb

I use transaction for mulitple doc change so:
you need to allowed replica set member, when u use mongodb in localhost
Or use mongodb in atals so will not have problem with transactions

Start the Server with:
node index.js or npm start
This will launch the Node server on port 3000. .

Open up your browser and go head to:

http://localhost:5000/api/v1/articles
http://localhost:3000/api/v1/users
http://localhost:3000/api/v1/categories

You should see an empty arry []. That confirms that you have set up everything successfully.

Access api over Heroku:
https://blog-api-4.herokuapp.com/

Access api over Raiway:
https://blog-api-production-92e5.up.railway.app/api-docs/
