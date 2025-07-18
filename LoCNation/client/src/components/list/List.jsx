import "./list.scss"; // Import the SCSS file for styling
import Card from "../card/Card"; // Import the Card component

// List Component - Displays a list of posts
function List({ posts }) {
  return (
    <div className="list">
      {/* Map through the posts array and render a Card component for each post */}
      {posts.map((item) => (
        <Card key={item.id} item={item} /> // Unique key 
      ))}
    </div>
  );
}

export default List; 
