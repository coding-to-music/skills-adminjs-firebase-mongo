const httpStatus = require("http-status");
const ApiError = require("../helpers/ApiError");

const domain = require("../models/skills/domains.model.js");

const createDomains = async (domainData) => {
	const domainInDB = await domain.findOne({
		domainName: { $regex: domainData.domainName, $options: "i" },
	});

	if (domainInDB) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Domain Already Exists");
	}

	const newDomain = await domain.create({ domainData });

	return newDomain;
};

const updateDomain = async (id, domainData) => {
	const domainInDB = await domain.findById(id);

	if (domainData.adminName !== domainInDB.adminName) {
		domainInDB.adminName = domainData.adminName;
	}
	if (domainData.domainName !== domainInDB.domainName) {
		domainInDB.domainName = domainData.domainName;
	}
	if (domainData.description !== domainInDB.description) {
		domainInDB.description = domainData.description;
	}

	domainInDB.tasks = domainData.tasks;
	domainInDB.mentors = domainData.mentors;

	const updatedDomain = await domainInDB.save();

	return updatedDomain;
};

const readDomainData = async (domainReq) => {
	const domainInDB = await domain.findOne({
		domainName: { $regex: domainReq, $options: "i" },
	});

	if (!domainInDB) {
		throw new ApiError(httpStatus.UNAUTHORIZED, "Domain does not exists");
	}

	return domainInDB;
};

module.exports = { createDomains, updateDomain, readDomainData };
