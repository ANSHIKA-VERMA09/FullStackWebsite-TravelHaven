
const Listing=require("../models/listing");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  try {
      let { id } = req.params;
      const listing = await Listing.findById(id)
      .populate({path: "reviews", populate: {
          path: "author",
      },
  })
      .populate("owner");
      if (!listing) {
          req.flash("error", "Listing does not exist!");
          return res.redirect("/listings");
      }
      // console.log(listing);
      res.render("listings/show.ejs", { listing });
  } catch (error) {
      req.flash("error", "Something went wrong!");
      res.redirect("/listings");
  }
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
      query:req.body.listing.location,
      limit: 1,
    })
  .send();
  // console.log(response.body.features[0].geometry);

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file !== "undefined") {
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = { url, filename };
  await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.filter = async(req,res,next)=>{
  let {id} = req.params;
  let allListings = await Listing.find({category: id});
  console.log(id);
  if(allListings.length != 0){
      res.render("listings/index.ejs", { allListings });
  }else{
      req.flash("error",`No listing with ${id}`);
      res.redirect("/listings")
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
module.exports.searchResult = async (req, res) => {
  let { q } = req.query;
  if (!q) {
    res.redirect("/listings");
  }
  const results = await Listing.find({
    $or: [
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { title: { $regex: q, $options: "i" } },
    ],
  });
  if (results.length === 0) {
    req.flash("error", `No listing exists for '${q}'`);
    return res.redirect("/listings");
  }
  res.render("listings/search.ejs", { results, query: q });
};