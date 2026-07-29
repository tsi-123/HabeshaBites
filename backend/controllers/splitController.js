import splitModel from "../models/splitModel.js";
import crypto from "crypto";
export { createSplit, getShare, payShare, getSplitProgress };

const getShare = async (req, res) => {
  try {

    const { token } = req.params;

    const split = await splitModel.findOne({
      "shares.token": token,
    });

    if (!split) {
      return res.json({
        success: false,
        message: "Payment not found",
      });
    }

    const share = split.shares.find(
      (item) => item.token === token
    );

    res.json({
      success: true,
      share,
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });

  }
};

const payShare = async (req, res) => {

  try {

    const { token } = req.params;

    const split = await splitModel.findOne({
      "shares.token": token,
    });

    if (!split)
      return res.json({
        success: false,
      });

    const share = split.shares.find(
      (item) => item.token === token
    );

    share.status = "Paid";
    share.paidAt = new Date();

    await split.save();

    res.json({
      success: true,
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message,
    });

  }

};

const getSplitProgress = async (req, res) => {
  try {

    const { orderId } = req.params;

    const split = await splitModel.findOne({ orderId });

    if (!split) {
      return res.json({
        success: false,
        message: "Split not found",
      });
    }

    const total = split.shares.length;

    const paid = split.shares.filter(
      (share) => share.status === "Paid"
    ).length;

    res.json({
      success: true,
      total,
      paid,
      shares: split.shares,
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message,
    });

  }
};

const createSplit = async (req, res) => {

    try {

        const { total, people } = req.body;

        if (!total || !people) {
            return res.json({
                success: false,
                message: "Missing data",
            });
        }

        const amountPerPerson = total / people;

        const shares = [];

        for (let i = 0; i < people; i++) {

            shares.push({

                token: crypto.randomUUID(),

                amount: amountPerPerson,

                status: "Waiting",

            });

        }

        const split = await splitModel.create({

            orderId: crypto.randomUUID(),

            total,

            people,

            shares,

        });

        res.json({

            success: true,

            split,

        });

    } catch (error) {

        console.log(error);

        res.json({

            success: false,

            message: error.message,

        });

    }

};
