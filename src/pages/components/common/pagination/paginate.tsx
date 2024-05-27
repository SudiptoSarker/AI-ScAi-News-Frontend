'use client'
import ReactPaginate from 'react-paginate';
import { useState } from 'react';

import _pagination from '../../common/pagination/paginate.module.scss'

import { IoIosArrowForward,IoIosArrowBack } from "react-icons/io"
import { useTranslation } from 'next-i18next';

// Define the type of the 'items' prop
interface PaginatedItemsProps {
  items: any[]; // Adjust the type according to the actual type of 'items'
}

// Define the type of the 'event' parameter
interface PageClickEvent extends React.MouseEvent<HTMLButtonElement> {
  selected: number;
}
interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement; // Specify the type of the event target
}
interface SelectChangeEvent extends React.ChangeEvent<HTMLSelectElement> {
  target: HTMLSelectElement; // Specify the type of the event target
}

export default function PaginatedItems({ items = [] }: PaginatedItemsProps) {
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);
  const[itemsPerPage, setItemsPerPage] = useState(5)

  // Simulate fetching items from another resources.
  // (This could be items from props; or items loaded in a local state
  // from an API endpoint with useEffect and useState)
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = items.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(items.length / itemsPerPage);

  // Invoke when user click to request another page.
  const handlePageClick = (event: PageClickEvent) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
};

const handleChange = (event: SelectChangeEvent) => {
  const selectedItemsPerPage = parseInt(event.target.value, 10);
  setItemsPerPage(selectedItemsPerPage);
};
const { t } = useTranslation();
  return (
    <>
        {currentItems}
        <div className={`d-flex justify-content-between ${_pagination['page_body']}`}>
          <div className={`${_pagination.item_container} px-0`}>   
            <label className="items-per-page-label">
            {t("common.data_per_page_text_1")}
              <select className={`items-per-page-dropdown ${_pagination.custome_showperpage}`} value={itemsPerPage} onChange={handleChange}>
                {[5, 10, 15, 20].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              &nbsp; {t("common.data_per_page_text_2")}
            </label>
          </div>                  
          
          <div className={`${_pagination['pagination-container']}`}>
            <ReactPaginate
              previousLabel={<span><IoIosArrowBack /></span>}
              nextLabel={<span><IoIosArrowForward /></span>}
              breakLabel={<span className={_pagination.ellipsis}>...</span>}
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={_pagination.pagination}
              activeClassName={_pagination.active}
              previousLinkClassName={_pagination.previous}
              nextLinkClassName={_pagination.next}
              disabledClassName={_pagination.disabled}
            />
          </div>
        </div>     
    </>
  );
}