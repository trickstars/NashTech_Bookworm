import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  // Get the 'id' parameter from the URL
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Product Detail Page</h1>
      <p>Product ID: {id}</p>
      {/* Add Product Detail page content here, using the 'id' */}
    </div>
  );
};

export default ProductDetailPage;