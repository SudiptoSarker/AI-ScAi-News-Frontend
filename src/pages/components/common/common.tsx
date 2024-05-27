import React from 'react';
import { useState } from "react";

import _pagination from '../common/pagination/paginate.module.scss';
import ReactPaginate from 'react-paginate';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useTranslation } from 'next-i18next';

//DEFAULT ITEM FOR PER PAGE ROW
const DEFAULT_ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 4; // Maximum number of visible page numbers

interface PaginationProps {
    currentItems: any[]; // Adjust the type of currentItems as per your requirement
    itemsPerPage: number;
    handleItemsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    handlePageChange: (selectedItem: { selected: number }) => void;
    totalPages: number;
    MAX_VISIBLE_PAGES:number;
}

//COMMON PAGINATION 
export function Paginations({ currentItems, itemsPerPage, handleItemsPerPageChange, handlePageChange, totalPages,MAX_VISIBLE_PAGES }: PaginationProps): JSX.Element {
    const { t } = useTranslation();
    return (
        <div className="d-flex justify-content-between">
            <div className={`${_pagination.item_container} px-0`}>   
            <label className="items-per-page-label">
            {t("common.data_per_page_text_1")}
                <select className={`items-per-page-dropdown ${_pagination.custome_showperpage}`} value={itemsPerPage} onChange={handleItemsPerPageChange}>
                {[5, 10, 15, 20,50,100].map((option) => (
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
                pageCount={totalPages}
                marginPagesDisplayed={1}
                pageRangeDisplayed={MAX_VISIBLE_PAGES - 2}
                onPageChange={handlePageChange}
                containerClassName={_pagination.pagination}
                activeClassName={_pagination.active}
                previousLinkClassName={_pagination.previous}
                nextLinkClassName={_pagination.next}
                disabledClassName={_pagination.disabled}
            />
            </div>

        </div>        
    );
}

//*****LOADER****/ 
export function Loader(): JSX.Element {
    return (
        // <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        //     <img
        //         src="/images/scai/loader.gif"
        //         alt="Loading..."
        //         style={{ width: '22%', height: '10%', borderRadius: '20px' }} // Set the desired width and height for loader
        //     />
        //     <strong style={{ marginTop: '10px' }}>しばらくお待ちください...</strong> {/* Adjust the margin top */}
        // </div>
        <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

export default Loader; 