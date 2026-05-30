import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FiChevronLeft, FiChevronRight, FiChevronDown } from "react-icons/fi";
import SingleProductItem from "../Components/Product/SingleProductGridItem";
import { MOCK_PRODUCTS } from "../data/products";

const ITEMS_PER_PAGE = 8;

export default function ShopAllPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("Newest Arrivals");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = ["All Products", "Men", "Women", "Accessories"];
  const sortOptions = [
    "Newest Arrivals",
    "Price: Low to High",
    "Price: High to Low",
  ];

  // Helper to parse price string to number for sorting
  const parsePrice = (priceStr) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter and Sort logic
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter by category
    let items = [...MOCK_PRODUCTS];
    if (selectedCategory !== "All Products") {
      items = items.filter((product) => product.category === selectedCategory);
    }

    // 2. Sort items
    if (sortBy === "Price: Low to High") {
      items.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === "Price: High to Low") {
      items.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else {
      // "Newest Arrivals" (Default) - sort by date descending, then ID descending
      items.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return b.id - a.id;
      });
    }

    return items;
  }, [selectedCategory, sortBy]);

  // Handle category pill clicks (resets pagination to page 1)
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Pagination logic (dynamic based on current filtered items)
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE));
  
  // Slice products to show only the current page's products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top of product grid area on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-10 md:py-16 px-4 sm:px-8 md:px-16 text-[#1d1b20]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* -- TODO: Backend Integration ---------------------------------------
            When integrating the real backend API:
            1. Replace MOCK_PRODUCTS with a state from a fetch call, RTK Query, or React Query.
            2. For server-side pagination & filtering, pass query parameters:
               `GET /api/products?page=${currentPage}&limit=8&category=${selectedCategory}&sort=${sortBy}`
            3. Make sure to update the pagination and filter states based on metadata returned by the API (e.g. `totalCount`, `totalPages`).
            -------------------------------------------------------------------- */}

        {/* PAGE HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#4f378a]/70 uppercase block mb-1">
              NEW SEASON
            </span>
            <h1 className="text-[36px] sm:text-[44px] md:text-[52px] font-extrabold text-[#1d1b20] tracking-tight leading-none">
              Shop All
            </h1>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[#49454f] leading-relaxed md:text-right font-medium">
            Explore our curated collection of essentials, designed for the modern lifestyle with premium materials.
          </p>
        </div>

        {/* CONTROLS SECTION: FILTERS & SORT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e6e0e9] pb-6 mb-8">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`
                    px-5 py-2.5
                    text-xs sm:text-sm font-semibold
                    rounded-full
                    transition-all duration-300 cursor-pointer border-none
                    ${
                      isActive
                        ? "bg-[#4f378a] text-white shadow-[0_4px_12px_rgba(79,55,138,0.25)] hover:bg-[#5f479a]"
                        : "bg-[#ece5dd]/80 text-[#49454f] hover:bg-[#ece5dd] hover:text-[#1d1b20]"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown Selector */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            
            {/* Custom Sort Select dropdown for highly polished visual design */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="
                  flex items-center gap-2
                  px-4 py-2.5
                  bg-transparent border-none
                  text-xs sm:text-sm font-semibold text-[#1d1b20]
                  cursor-pointer hover:opacity-85 transition-opacity
                "
              >
                <span className="text-[#49454f] font-medium mr-1">Sort by:</span>
                <span>{sortBy}</span>
                <FiChevronDown
                  className={`w-4 h-4 text-[#49454f] transition-transform duration-300 ${
                    isSortOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Absolute Dropdown Overlay */}
              {isSortOpen && (
                <div
                  className="
                    absolute right-0 mt-1.5 w-[200px]
                    bg-white border border-[#e6e0e9]
                    rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                    py-2 z-40
                    animate-in fade-in slide-in-from-top-2 duration-200
                  "
                >
                  {sortOptions.map((option) => {
                    const isSelected = sortBy === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortOpen(false);
                          setCurrentPage(1); // Reset page on sort change
                        }}
                        className={`
                          w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold border-none cursor-pointer
                          ${
                            isSelected
                              ? "text-[#4f378a] bg-[#f2ecf4]"
                              : "text-[#49454f] bg-transparent hover:bg-[#F5F0EB] hover:text-[#1d1b20]"
                          }
                        `}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
            {paginatedProducts.map((product) => (
              <SingleProductItem
                key={product.id}
                name={product.name}
                price={product.price}
                img={product.img}
                onClick={() => navigate(`/product/${product.id}`)}
                onAddToCart={() => {
                  toast.success(`${product.name} added to cart`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-[#e6e0e9] mb-16">
            <p className="text-base text-[#49454f] font-semibold">
              No products found in this category.
            </p>
          </div>
        )}

        {/* PAGINATION SECTION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 md:gap-3 py-4">
            
            {/* Left Chevron Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                w-10 h-10 rounded-full border border-[#e6e0e9] bg-white
                flex items-center justify-center cursor-pointer transition-all duration-300
                hover:border-[#4f378a] hover:text-[#4f378a]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e6e0e9] disabled:hover:text-inherit
              `}
              aria-label="Previous Page"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Number circles */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isPageActive = currentPage === pageNumber;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`
                    w-10 h-10 rounded-full font-bold text-sm
                    flex items-center justify-center cursor-pointer border-none transition-all duration-300
                    ${
                      isPageActive
                        ? "bg-[#4f378a] text-white shadow-[0_4px_12px_rgba(79,55,138,0.25)]"
                        : "bg-transparent text-[#49454f] hover:bg-[#ece5dd] hover:text-[#1d1b20]"
                    }
                  `}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Right Chevron Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                w-10 h-10 rounded-full border border-[#e6e0e9] bg-white
                flex items-center justify-center cursor-pointer transition-all duration-300
                hover:border-[#4f378a] hover:text-[#4f378a]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e6e0e9] disabled:hover:text-inherit
              `}
              aria-label="Next Page"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
