import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

// GET ALL POSTS (Filter by various criteria)
export const getPosts = async (req, res) => {
  const query = req.query;
  
  try {
    // Helper function to check if a query parameter exists
    const hasQueryParam = (param) => {
      return param !== undefined && param !== '' && param !== null;
    };

    // Build the where clause
    const whereClause = {};
    
    // Add filters only if they are explicitly provided
    if (hasQueryParam(query.city)) {
      // Convert city names to lowercase and normalize accents for case-insensitive and accent-insensitive matching
      const normalizedCity = query.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      whereClause.OR = [
        { city: { equals: query.city, mode: 'insensitive' } }, // Case-insensitive exact match
        { 
          city: { 
            contains: normalizedCity,
            mode: 'insensitive'
          } 
        }
      ];
    }
    if (hasQueryParam(query.type)) whereClause.type = query.type;
    if (hasQueryParam(query.property)) whereClause.property = query.property;
    if (hasQueryParam(query.bedroom)) whereClause.bedroom = parseInt(query.bedroom);
    if (hasQueryParam(query.locationType)) whereClause.locationType = query.locationType;
    if (hasQueryParam(query.genre)) whereClause.genre = query.genre;
    
    // Handle locationFeatures
    if (hasQueryParam(query.locationFeatures)) {
      whereClause.locationFeatures = {
        hasSome: Array.isArray(query.locationFeatures) 
          ? query.locationFeatures 
          : [query.locationFeatures]
      };
    }
    
    // Handle price range
    if (hasQueryParam(query.minPrice) || hasQueryParam(query.maxPrice)) {
      whereClause.price = {};
      if (hasQueryParam(query.minPrice)) whereClause.price.gte = parseInt(query.minPrice);
      if (hasQueryParam(query.maxPrice)) whereClause.price.lte = parseInt(query.maxPrice);
    }

    // Initialize postDetail filters object
    const postDetailFilters = {};
    
    // Add postDetail filters only if they are explicitly provided
    if (hasQueryParam(query.size)) postDetailFilters.size = { gte: parseInt(query.size) };
    if (hasQueryParam(query.school)) postDetailFilters.school = { gte: parseInt(query.school) };
    if (hasQueryParam(query.bus)) postDetailFilters.bus = { gte: parseInt(query.bus) };
    if (hasQueryParam(query.restaurant)) postDetailFilters.restaurant = { gte: parseInt(query.restaurant) };
    if (hasQueryParam(query.minSize)) postDetailFilters.size = { ...(postDetailFilters.size || {}), gte: parseInt(query.minSize) };
    if (hasQueryParam(query.maxSize)) postDetailFilters.size = { ...(postDetailFilters.size || {}), lte: parseInt(query.maxSize) };
    if (hasQueryParam(query.crewSize)) postDetailFilters.crewSize = { gte: parseInt(query.crewSize) };
    
    // Handle boolean filters - only include if explicitly set to 'true'
    if (query.hasFilmingPermit === 'true') postDetailFilters.hasFilmingPermit = true;
    if (query.hasStudio === 'true') postDetailFilters.hasStudio = true;
    if (query.hasPower === 'true') postDetailFilters.hasPower = true;
    if (query.availableParking === 'true') postDetailFilters.availableParking = true;
    
    // Only include postDetail in whereClause if there are any postDetail filters
    if (Object.keys(postDetailFilters).length > 0) {
      whereClause.postDetail = postDetailFilters;
    }

    // Log incoming query parameters
    // Log incoming query parameters and generated where clause
    console.log('\n=== Incoming Query Parameters ===');
    console.log('Basic filters:', {
      city: query.city,
      type: query.type,
      property: query.property,
      bedroom: query.bedroom,
      locationType: query.locationType
    });
    console.log('Price range:', { min: query.minPrice, max: query.maxPrice });
    console.log('Boolean filters:', {
      hasFilmingPermit: query.hasFilmingPermit,
      hasStudio: query.hasStudio,
      hasPower: query.hasPower,
      availableParking: query.availableParking
    });
    console.log('Numeric filters:', {
      crewSize: query.crewSize,
      minSize: query.minSize,
      maxSize: query.maxSize,
      size: query.size
    });
    console.log('\n=== Generated Prisma Where Clause ===');
    console.log(JSON.stringify(whereClause, null, 2));
    console.log('\n=== Executing Database Query ===');

    const startTime = Date.now();
    // Execute the query
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const endTime = Date.now();
    // Log the number of posts found and query time
    console.log(`\n=== Query Results ===`);
    console.log(`Found ${posts.length} posts in ${endTime - startTime}ms`);
    console.log('Sample of returned posts:', posts.slice(0, 2).map(p => ({
      id: p.id,
      title: p.title,
      locationType: p.locationType,
      hasFilmingPermit: p.postDetail?.hasFilmingPermit,
      hasStudio: p.postDetail?.hasStudio,
      hasPower: p.postDetail?.hasPower,
      availableParking: p.postDetail?.availableParking
    })));
    
    // Send the response
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

// GET A SINGLE POST (Includes `isSaved` status)
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const token = req.cookies?.token;
    if (!token) {
      return res.status(200).json({ ...post, isSaved: false });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        return res.status(200).json({ ...post, isSaved: false });
      }

      const saved = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            postId: id,
            userId: payload.id,
          },
        },
      });

      res.status(200).json({ ...post, isSaved: saved ? true : false });
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

// CREATE A NEW POST
export const addPost = async (req, res) => {
  const { postData, postDetail } = req.body;
  const tokenUserId = req.userId;

  try {
    // Input validation
    if (!postData || !postDetail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure images is an array and has at least one image
    if (!Array.isArray(postData.images) || postData.images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Parse post data with proper type conversion
    const parsedPostData = {
      ...postData,
      price: parseInt(postData.price) || 0,
      bedroom: parseInt(postData.bedroom) || 0,
      bathroom: parseInt(postData.bathroom) || 0,
      locationType: postData.locationType || 'indoor', // Default to indoor if not specified
      genre: postData.genre === 'Sci-Fi' ? 'SciFi' : (postData.genre || 'Drama') // Convert 'Sci-Fi' to 'SciFi' to match enum
    };
    
    // Log the parsed data for debugging
    console.log('Parsed post data with genre:', JSON.stringify(parsedPostData, null, 2));
    console.log('Genre value being saved:', parsedPostData.genre);
    
    console.log('Post data after processing:', JSON.stringify(parsedPostData, null, 2));

    const parsedPostDetail = {
      ...postDetail,
      size: postDetail.size ? parseInt(postDetail.size) : null,
      school: postDetail.school ? parseInt(postDetail.school) : null,
      bus: postDetail.bus ? parseInt(postDetail.bus) : null,
      restaurant: postDetail.restaurant ? parseInt(postDetail.restaurant) : null,
      crewSize: postDetail.crewSize ? parseInt(postDetail.crewSize) : null,
      hasFilmingPermit: Boolean(postDetail.hasFilmingPermit),
      hasStudio: Boolean(postDetail.hasStudio),
      hasPower: Boolean(postDetail.hasPower),
      availableParking: Boolean(postDetail.availableParking),
    };

    // Log the complete data being sent to Prisma
    console.log('Creating post with data:', {
      ...parsedPostData,
      userId: tokenUserId,
      postDetail: {
        create: parsedPostDetail
      }
    });

    // Wrap the Prisma operation in a try-catch for better error handling
    try {
      const newPost = await prisma.post.create({
        data: {
          ...parsedPostData,
          userId: tokenUserId,
          postDetail: {
            create: parsedPostDetail,
          },
        },
        include: {
          postDetail: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      console.log('Successfully created post:', newPost.id);
      res.status(200).json(newPost);
    } catch (prismaError) {
      console.error('Prisma error details:', {
        message: prismaError.message,
        code: prismaError.code,
        meta: prismaError.meta,
        stack: prismaError.stack
      });
      throw prismaError; // Re-throw to be caught by the outer catch
    }
  } catch (err) {
    console.error("Error creating post:", err);
    console.error("Detailed error:", JSON.stringify({
      message: err.message,
      name: err.name,
      stack: err.stack,
      code: err.code,
      meta: err.meta,
      fullError: err
    }, null, 2));
    
    // Log the exact data that caused the error
    console.error("Request data that caused the error:", JSON.stringify({
      postData: postData,
      postDetail: postDetail,
      tokenUserId: tokenUserId
    }, null, 2));
    
    res.status(500).json({ 
      message: "Failed to create post",
      error: err.message,
      code: err.code,
      meta: err.meta,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// UPDATE A POST
export const updatePost = async (req, res) => {
  console.log('Update post request received:', {
    postId: req.params.id,
    body: req.body,
    userId: req.userId
  });

  const { postData, postDetail } = req.body;
  const tokenUserId = req.userId;
  const postId = req.params.id;

  try {
    // First verify the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Prepare the update data
    const updateData = {
      ...(postData && {
        ...postData,
        ...(postData.price && { price: parseInt(postData.price) }),
        ...(postData.bedroom && { bedroom: parseInt(postData.bedroom) }),
        ...(postData.bathroom && { bathroom: parseInt(postData.bathroom) }),
        // Handle locationType - include it if it's present in the request
        ...(postData.locationType !== undefined && {
          locationType: postData.locationType || null
        }),
      }),
      ...(postDetail && {
        postDetail: {
          update: {
            ...postDetail,
            ...(postDetail.size && { size: parseInt(postDetail.size) }),
            ...(postDetail.school && { school: parseInt(postDetail.school) }),
            ...(postDetail.bus && { bus: parseInt(postDetail.bus) }),
            ...(postDetail.restaurant && { restaurant: parseInt(postDetail.restaurant) }),
            ...(postDetail.crewSize && { crewSize: parseInt(postDetail.crewSize) }),
            ...(postDetail.hasFilmingPermit !== undefined && { hasFilmingPermit: Boolean(postDetail.hasFilmingPermit) }),
            ...(postDetail.hasStudio !== undefined && { hasStudio: Boolean(postDetail.hasStudio) }),
            ...(postDetail.hasPower !== undefined && { hasPower: Boolean(postDetail.hasPower) }),
            ...(postDetail.availableParking !== undefined && { availableParking: Boolean(postDetail.availableParking) }),
          },
        },
      }),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    console.log('Attempting to update post with data:', {
      postId,
      updateData,
      postDetail
    });

    // Verify MongoDB connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection verified');

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    console.log('Post updated successfully:', updatedPost.id);
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', {
      message: err.message,
      name: err.name,
      code: err.code,
      meta: err.meta,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    // Handle specific Prisma errors
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        message: 'Post not found or no changes made',
        error: err.meta?.cause || err.message 
      });
    }

    res.status(500).json({ 
      message: 'Failed to update post',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

// DELETE A POST
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({ where: { id } });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// TOGGLE SAVING A POST (Save/Unsave)
export const savePost = async (req, res) => {
  const { postId } = req.body;
  const tokenUserId = req.userId;

  try {
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          postId,
          userId: tokenUserId,
        },
      },
    });

    if (existingSave) {
      await prisma.savedPost.delete({
        where: {
          userId_postId: {
            postId,
            userId: tokenUserId,
          },
        },
      });
      return res.status(200).json({ message: "Post unsaved", isSaved: false });
    } else {
      await prisma.savedPost.create({
        data: {
          postId,
          userId: tokenUserId,
        },
      });
      return res.status(200).json({ message: "Post saved", isSaved: true });
    }
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).json({ message: "Failed to save post" });
  }
};
