import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import { Await, useLoaderData } from "react-router-dom";
import { Suspense } from "react";

function ListPage() {
  const data = useLoaderData();

  return (
    <div className="listPage">
      {/* Left Section: List of Posts */}
      <div className="listContainer">
        <div className="wrapper">
          <Filter />

          {/* Suspense ensures a smooth loading state while waiting for data */}
          <Suspense fallback={<p>Loading posts...</p>}>
            <Await resolve={data.postResponse} errorElement={<p>Error loading posts!</p>}>
              {(postResponse) =>
                postResponse?.data?.length > 0 ? (
                  postResponse.data.map((post) => <Card key={post.id} item={post} />)
                ) : (
                  <p>No posts found.</p>
                )
              }
            </Await>
          </Suspense>
        </div>
      </div>

      {/* Right Section: Map displaying locations */}
      <div className="mapContainer">
        <Suspense fallback={<p>Loading map...</p>}>
          <Await resolve={data.postResponse} errorElement={<p>Error loading map data!</p>}>
            {(postResponse) =>
              postResponse?.data?.length > 0 ? <Map items={postResponse.data} /> : <p>No locations available.</p>
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export default ListPage;
