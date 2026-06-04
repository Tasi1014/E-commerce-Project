import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiX } from "react-icons/fi";
import SingleProductItem from "../Components/Product/SingleProductGridItem";
import { fetchProducts, searchProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";

const ITEMS_PER_PAGE = 8;

export default function ShopAllPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Products");
  const [sortBy, setSortBy] = useState("Newest Arrivals");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const dropdownRef = useRef(null);

  const categories = ["All Products", "Men", "Women", "Accessories"];
  const sortOptions = ["Newest Arrivals", "Price: Low to High", "Price: High to Low"];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state when URL query params change (navigating from other pages)
  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    const newCategory = searchParams.get("category") || "All Products";

    if (newSearch !== searchTerm) {
      setSearchTerm(newSearch);
      setCurrentPage(1);
      if (newSearch) setSelectedCategory("All Products");
    }

    if (!newSearch && newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Fetch products when filters / search / page change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: ITEMS_PER_PAGE };
        if (searchTerm) {
          params.q = searchTerm;
          const response = await searchProducts(params);
          setProducts(response.data.products);
          setPagination(response.data.pagination);
        } else {
          if (selectedCategory !== "All Products") params.category = selectedCategory;
          params.sort = sortBy;
          const response = await fetchProducts(params);
          setProducts(response.data.products);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load products.");
        setProducts([]);
        setPagination({ currentPage: 1, totalPages: 1, totalProducts: 0 });
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, sortBy, currentPage, searchTerm]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (searchTerm) {
      setSearchTerm("");
    }
    // Sync the category into the URL so back-navigation/sharing works
    if (category === "All Products") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSortChange = (option) => {
    setSortBy(option);
    setIsSortOpen(false);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchParams({});
    setCurrentPage(1);
    setSelectedCategory("All Products");
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  if (loading && products.length === 0) {
    return (
      <div className="bg-[#F5F0EB] min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="text-[#49454f]">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-10 md:py-16 px-4 sm:px-8 md:px-16 text-[#1d1b20]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#4f378a]/70 uppercase block mb-1">
              NEW SEASON
            </span>
            <h1 className="text-[36px] sm:text-[44px] md:text-[52px] font-extrabold tracking-tight leading-none">
              {searchTerm ? `Search: “${searchTerm}”` : "Shop All"}
            </h1>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[#49454f] leading-relaxed md:text-right">
            Explore our curated collection of essentials...
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e6e0e9] pb-6 mb-8">
          {!searchTerm && (
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-[#4f378a] text-white shadow-md hover:bg-[#5f479a]"
                      : "bg-[#ece5dd]/80 text-[#49454f] hover:bg-[#ece5dd]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {searchTerm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#49454f]">Results for:</span>
              <span className="text-sm font-semibold text-[#4f378a]">{searchTerm}</span>
              <button
                onClick={handleClearSearch}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full border text-xs font-medium hover:bg-[#f2ecf4]"
              >
                <FiX className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold">
              <span className="text-[#49454f]">Sort by:</span> {sortBy}
              <FiChevronDown className={`transition-transform ${isSortOpen ? "rotate-180" : "rotate-0"}`} />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-1.5 w-[200px] bg-white border rounded-xl shadow-md py-2 z-40">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSortChange(opt)}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold ${sortBy === opt ? "text-[#4f378a] bg-[#f2ecf4]" : "text-[#49454f] hover:bg-[#F5F0EB]"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
            {products.map((product) => (
              <SingleProductItem
                key={product._id}
                name={product.name}
                price={formatPrice(product.price)}
                img={product.mainImage}
                onClick={() => navigate(`/product/${product._id}`)}
                onAddToCart={() => addToCart({ id: product._id, name: product.name, price: product.price, image: product.mainImage }, null, "", 1)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed mb-16">
            <p className="text-base text-[#49454f] font-semibold">
              {searchTerm ? `No products found for “${searchTerm}”. Try another keyword.` : "No products in this category."}
            </p>
            {searchTerm && (
              <button onClick={handleClearSearch} className="mt-4 px-6 py-2 bg-[#4f378a] text-white rounded-full text-sm">
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 md:gap-3 py-4">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 rounded-full border bg-white flex items-center justify-center disabled:opacity-40">
              <FiChevronLeft />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 rounded-full font-bold text-sm ${currentPage === i + 1 ? "bg-[#4f378a] text-white shadow-md" : "bg-transparent text-[#49454f] hover:bg-[#ece5dd]"}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="w-10 h-10 rounded-full border bg-white flex items-center justify-center disabled:opacity-40">
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}