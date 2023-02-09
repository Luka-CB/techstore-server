const asyncHandler = require("express-async-handler");
const date = require("date-and-time");
const User = require("../models/User");

//////////////////////////////-----GET CUSTOMERS-----//////////////////////////////

const getCustomers = asyncHandler(async (req, res) => {
  const { searchQ, page, perPage } = req.query;

  const keyword = searchQ
    ? {
        $or: [
          { username: { $regex: searchQ, $options: "i" } },
          { email: { $regex: searchQ, $options: "i" } },
        ],
      }
    : {};

  const limit = searchQ ? 20 : perPage;

  const options = {
    page: page || 1,
    limit,
  };

  const customers = await User.paginate({ ...keyword }, options);
  if (!customers) throw new Error("Get customers request has failed!");

  const paginationData = {
    totalDocs: customers.totalDocs,
    limit: customers.limit,
    totalPages: customers.totalPages,
    page: customers.page,
    pagingCounter: customers.pagingCounter,
    hasPrevPage: customers.hasPrevPage,
    hasNextPage: customers.hasNextPage,
    prevPage: customers.prevPage,
    nextPage: customers.nextPage,
  };

  const modifiedCustomers = customers.docs.map((doc) => {
    const newDate = date.format(new Date(doc.createdAt), "DD/MM/YYYY");
    return { ...doc._doc, createdAt: newDate };
  });

  res.status(200).json({ customers: modifiedCustomers, paginationData });
});

//////////////////////////////-----CHANGE ADMIN STATUS-----//////////////////////////////

const changeAdminStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  const updatedUser = await User.updateOne(
    { _id: userId },
    { isAdmin: user.isAdmin ? false : true }
  );
  if (!updatedUser)
    throw new Error("Change user admin status request has failed!");

  res.status(200).json({ msg: "Status Changed Successfully!" });
});

//////////////////////////////-----DELETE CUSTOMERS-----//////////////////////////////

const deleteCustomers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  const deletedCustomers = await User.deleteMany({
    _id: { $in: userIds },
    isAdmin: false,
  });
  if (!deletedCustomers)
    throw new Error("Delete customers request has Failed!");

  res.status(200).json({ msg: "Customers Deleted Successfully!" });
});

//////////////////////////////-----DELETE CUSTOMER-----//////////////////////////////

const deleteCustomer = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const isAdmin = await User.findOne({ _id: userId, isAdmin: true });
  if (isAdmin) throw new Error("You don't have a permission to delete admin!");

  const deletedCustomer = await User.deleteOne({ _id: userId });
  if (!deletedCustomer) throw new Error("Delete customer request has failed!");

  res.status(200).json({ msg: "Customer deleted successfully!" });
});

module.exports = {
  getCustomers,
  changeAdminStatus,
  deleteCustomers,
  deleteCustomer,
};
