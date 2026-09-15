const Search = require("../models/Search");


// ==========================================
// GET SEARCH HISTORY
// ==========================================

const getSearchHistory = async (req, res) => {

    try {

        const searches = await Search.find({
            userId: req.userId,
        })
            .sort({
                createdAt: -1,
            })
            .select(
                "query resultCount createdAt"
            );


        res.status(200).json({
            success: true,
            count: searches.length,
            searches,
        });


    } catch (error) {

        console.error(
            "Get Search History Error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message:
                "Failed to fetch search history",
        });

    }
};



// ==========================================
// DELETE ONE SEARCH
// ==========================================

const deleteSearchHistory = async (req, res) => {

    try {

        const { id } = req.params;


        const search = await Search.findOneAndDelete({
            _id: id,
            userId: req.userId,
        });


        if (!search) {

            return res.status(404).json({
                success: false,
                message: "Search history not found",
            });

        }


        res.status(200).json({
            success: true,
            message:
                "Search history deleted successfully",
        });


    } catch (error) {

        console.error(
            "Delete Search Error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message:
                "Failed to delete search history",
        });

    }
};



// ==========================================
// DELETE ALL HISTORY
// ==========================================

const deleteAllSearchHistory = async (req, res) => {

    try {

        await Search.deleteMany({
            userId: req.userId,
        });


        res.status(200).json({
            success: true,
            message:
                "All search history deleted successfully",
        });


    } catch (error) {

        console.error(
            "Delete All Search History Error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message:
                "Failed to delete search history",
        });

    }
};


module.exports = {
    getSearchHistory,
    deleteSearchHistory,
    deleteAllSearchHistory,
};