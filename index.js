const express = require("express");
const qs = require("qs");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

const base_url = `${process.env.BASE_URL}`;
const PORT = `${process.env.PORT}`;

const cosOptions = {
  origin: [`${process.env.FRONTEND_URL}`],
};

app.use(cors(cosOptions));

const data = qs.stringify({
  grant_type: `${process.env.GRANT_TYPE}`,
  client_id: `${process.env.CLIENT_ID}`,
  client_secret: `${process.env.CLIENT_SECRET}`,
  scope: `${process.env.SCOPE}`,
});

const config = {
  method: "post",
  maxBodyLength: Infinity,
  url: `${process.env.TOKEN_URL}`,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: `${process.env.TOKEN_COOKIE}`,
  },
  data: data,
};

const getCartConfig = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${base_url}coveo_commercecarts?$select=coveo_name,coveo_cartinfo`,
};

const addToCartConfig = {
  method: "post",
  maxBodyLength: Infinity,
  url: `${base_url}coveo_commercecarts`,
};

const removeFromCartConfig = {
  method: "delete",
  maxBodyLength: Infinity,
};

const updateInCartConfig = {
  method: "put",
  maxBodyLength: Infinity,
};

//
app.get("/get-cart", async (req, res) => {
  try {
    const response1 = await axios.request(config);
    const token = JSON.stringify(response1.data["access_token"]);

    if (token) {
      const response2 = await axios.request({
        ...getCartConfig,
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.parse(token),
        },
      });

      if (response2.status === 200) {
        res.send({
          data: response2.data.value,
          cartLength: response2.data.value.length,
        });
      }
    }
  } catch (error) {
    res.send({ message: "Internal server error" });
    console.log("Error ", error);
  }
});

app.post("/add-to-cart", async (req, res) => {
  try {
    const response1 = await axios.request(config);
    const token = JSON.stringify(response1.data["access_token"]);

    if (token) {
      const response2 = await axios.request({
        ...addToCartConfig,
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.parse(token),
        },
        data: req.body,
      });

      if (response2.status === 204) {
        const response3 = await axios.request({
          ...getCartConfig,
          headers: {
            "Content-Type": "application/json",
            Authorization: JSON.parse(token),
          },
        });

        res.send({
          message: "Item added successfully",
          data: response3.data.value,
          cartLength: response3.data.value.length,
        });
      }
    }
  } catch (error) {
    res.send({ message: "Internal server error" });
    console.log("Error ", error);
  }
});

app.delete("/delete-from-cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response1 = await axios.request(config);
    const token = JSON.stringify(response1.data["access_token"]);

    if (token) {
      const response2 = await axios.request({
        ...removeFromCartConfig,
        url: `${base_url}coveo_commercecarts(${id})`,
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.parse(token),
        },
      });

      if (response2.status === 204) {
        res.send({ message: "Item deleted successfully" });
      }
    }
  } catch (error) {
    res.send({ message: "Internal server error" });
    console.log("Error ", error);
  }
});

app.put("/change-quantity/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response1 = await axios.request(config);
    const token = JSON.stringify(response1.data["access_token"]);

    let data = JSON.stringify({
      value: `[${req.body.value}]`,
    });

    if (token) {
      const response2 = await axios.request({
        ...updateInCartConfig,
        url: `${base_url}coveo_commercecarts(${id})/coveo_cartinfo`,
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.parse(token),
        },
        data: data,
      });

      if (response2.status === 204) {
        res.send({ message: "Quantity updated successfully" });
      }
    }
  } catch (error) {
    res.send({ message: "Internal server error" });
    console.log("Error ", error);
  }
});

app.listen(PORT, () => {
  console.log("We are live at ", PORT + "!");
});
