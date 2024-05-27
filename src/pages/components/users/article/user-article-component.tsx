'use client'
import { useState, useEffect, useRef, SetStateAction, ReactElement } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import { Row } from 'reactstrap';
import ReactDatePicker, { setDefaultLocale } from "react-datepicker";
import ReactPaginate from 'react-paginate';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

import themeStyleCom from "./article-component.module.scss"
import _pagination from '../../../styles/pagination/pagination.module.scss';
import { Loader, Paginations } from '../../common/common'
import { useTranslation } from 'next-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown,faStar  } from '@fortawesome/free-solid-svg-icons';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

let themeList: any = [];
let articleList: any = [];
var disabledDate = [new Date('2024-01-02'), new Date('2024-01-03')]

const DEFAULT_ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 4; // Maximum number of visible page numbers

interface Theme {
    theme_id: string;
    theme_title: string;
    themeTag: string;
    // Add any additional properties if necessary
}
interface Article {
    themeTitle: any;
    feedID: any;
    themeId: any;
    feedTitle: string;
    article: string;
    ex_link: string;
    isLike: any;
    // Add any additional properties if necessary
}

const Articles = () => {
    // const [userId, setUserId] = useState<any> ();
    const { t } = useTranslation();

    const [article_list, SetArticle] = useState<Article[]>([]);
    const [theme_list, setThemes] = useState<Theme[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [loading, setLoading] = useState(true);
    const [isThemeSelectAll, setIsThemeAll] = useState(true);
    
    //READ USER ARTICLES   
    function ReadArticleData(date: any, clickedItems: any) {
        let userId = localStorage.getItem('userid');
        userId = userId ? userId.trim() : '';
        const fetchData = async () => {
            try {
                await ReadUserWiseArticleBlob(date, clickedItems, userId);
                SetArticle(articleList);
                setThemes(themeList); // Corrected function name to setThemes
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }

    //PAGINATION START
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = article_list.slice(startIndex, endIndex);

    const totalPages = Math.ceil(article_list.length / itemsPerPage);

    const handlePageChange = (selectedPage: any) => {
        setCurrentPage(selectedPage.selected);
    };

    const handleItemsPerPageChange = (event: any) => {
        const selectedItemsPerPage = parseInt(event.target.value, 10);
        setItemsPerPage(selectedItemsPerPage);
        setCurrentPage(0); // Reset to the first page when changing items per page
    };
    //PAGINATION END

    /// State to track clicked theme_ids
    // const [clickedItems, setClickedItems] = useState([]);
    const [clickedItems, setClickedItems] =  useState<string[]>([]);

    // Function to handle click event for each div
    const handleClick = (themeId: any) => {
        setIsThemeAll(false);

        setCurrentPage(0);
        setLoading(true);

        const updatedClickedItems = clickedItems.includes(themeId)
            ? clickedItems.filter((id: string) => id !== themeId)
            : [...clickedItems, themeId];

        // Update the clickedItems state
        setClickedItems(updatedClickedItems);

        // Check if a date is selected
        if (selectedDate !== null) {
            // Call ReadArticleData function with the selected date and updated clickedItems array            
            ReadArticleData(selectedDate, updatedClickedItems);
        } else {
            // If no date is selected, call ReadArticleData function with an empty date string and updated clickedItems array
            ReadArticleData('', updatedClickedItems);
        }        
        // setIsThemeAll(false);
    };

    // when date picked changes.
    function onDateChange(date: Date) {
        setIsThemeAll(true);
        setLoading(true);
        setSelectedDate(date);

        // Clear the clicked items when date changes
        setClickedItems([]);
        ReadArticleData(date, '');             
    }

    //Call the function responsible for retrieving articles using blobs.
    useEffect(() => {
        if (selectedDate !== null) {
            onDateChange(selectedDate);            
        } else {
            setSelectedDate(null);
            ReadArticleData('', clickedItems);            
        }        
         
    }, [selectedDate]);



    // Define state variables to track the active/inactive state of each icon
    const [likeActive, setLikeActive] = useState(false);
    const [dislikeActive, setDislikeActive] = useState(false);
    const [likedThemeId, setThemeId] = useState()
    const [likedFeedId, setFeedId] = useState()

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    // Update the active/inactive state when the icons are clicked
    const handleLike = async (article: { themeTitle: any; feedID: any; themeId: any; feedTitle: string; article: string; ex_link: string; isLike: boolean | "" }) => {

        setThemeId(article.themeId);
        setFeedId(article.feedID);

        // Toggle the likeActive state
        setLikeActive(true);
        // Set dislikeActive to false to ensure only one of the icons is active at a time
        setDislikeActive(false);

        let userId = localStorage.getItem('userid');
        let userRole = localStorage.getItem('role');
        let res = await ReadArticleList(selectedDate, clickedItems, userId);
        // res = JSON.parse(res);
        UserFeedback_Article(article.themeId, article.feedID, true, res, userId, selectedDate);

        setIsLiked(true);
        setIsDisliked(false);

        ReadArticleData(selectedDate, clickedItems);


        // creating log for like.
        fetchApi('userActivity').then(function (data) {
            let _date = new Date();
            let timeStamp = _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
            let csvContent = "";
            let _mainArray = [];
            if (data == null) {
                let csvArray = [
                    ['userid', 'userrole', 'themetitle', 'feedtitle', 'activity', 'timestamp'],
                    [userId, userRole, article.themeTitle, article.feedTitle, 'like', timeStamp]
                ];

                csvArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\r\n";
                });
            }
            else {
                if (data.length > 0) {
                    let temp_array = data.split('\n');

                    if (temp_array.length > 0) {
                        temp_array.forEach(function (ra: any) {
                            let _subArray = ra.split(",");
                            _mainArray.push(_subArray);
                        });
                        _mainArray.push([userId, userRole, article.themeTitle, article.feedTitle, 'like', timeStamp]);
                    }

                }
                else {
                    _mainArray = [
                        ['userid', 'userrole', 'themetitle', 'feedtitle', 'activity', 'timestamp'],
                        [userId, userRole, article.themeTitle, article.feedTitle, 'like', timeStamp]
                    ];

                }

                _mainArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\r\n";
                });
            }

            fetch(`/api/write_csv?blobName=userActivity.csv&overwriteCase=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/csv',
                },
                body: csvContent,
            }).then(function (response) {
                response.json().then(function (data) {
                    console.log(data.message);
                });
            });
        });
    };

    const handleDislike = async (article: { themeTitle: any; feedID: any; themeId: any; feedTitle: string; article: string; ex_link: string; isLike: boolean | "" }) => {
        setThemeId(article.themeId);
        setFeedId(article.feedID);

        // Toggle the dislikeActive state
        setDislikeActive(true);
        // Set likeActive to false to ensure only one of the icons is active at a time
        setLikeActive(false);


        let userId = localStorage.getItem('userid');
        let userRole = localStorage.getItem('role');
        let res = await ReadArticleList(selectedDate, clickedItems, userId);
        // res = JSON.parse(res);
        UserFeedback_Article(article.themeId, article.feedID, false, res, userId, selectedDate);

        setIsLiked(false);
        setIsDisliked(true);

        ReadArticleData(selectedDate, clickedItems);

        // creating log for like.
        fetchApi('userActivity').then(function (data) {
            let _date = new Date();
            let timeStamp = _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
            let csvContent = "";
            let _mainArray = [];
            if (data == null) {
                let csvArray = [
                    ['userid', 'userrole', 'themetitle', 'feedtitle', 'activity', 'timestamp'],
                    [userId, userRole, article.themeTitle, article.feedTitle, 'like', timeStamp]
                ];

                csvArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\r\n";
                });
            }
            else {

                if (data.length > 0) {
                    let temp_array = data.split('\n');

                    if (temp_array.length > 0) {
                        temp_array.forEach(function (ra: any) {
                            let _subArray = ra.split(",");
                            _mainArray.push(_subArray);
                        });
                        _mainArray.push([userId, userRole, article.themeTitle, article.feedTitle, 'dislike', timeStamp]);
                    }

                }
                else {
                    _mainArray = [
                        ['userid', 'userrole', 'themetitle', 'feedtitle', 'activity', 'timestamp'],
                        [userId, userRole, article.themeTitle, article.feedTitle, 'dislike', timeStamp]
                    ];

                }

                _mainArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\n";
                });

            }


            
            fetch(`/api/write_csv?blobName=userActivity.csv&overwriteCase=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/csv',
                },
                body: csvContent,
            }).then(function (response) {
                response.json().then(function (data) {
                    console.log(data.message);
                });
            });


        });
    };

    const handleClear = () => {
        setIsThemeAll(false);
        setCurrentPage(0);
        setLoading(true);
        // Toggle the clicked state for the corresponding themeId
        const updatedClickedItems: any = [];

        // Update the clickedItems state
        setClickedItems(updatedClickedItems);
        // Check if a date is selected
        if (selectedDate !== null) {
            // Call ReadArticleData function with the selected date and updated clickedItems array            
            ReadArticleData(selectedDate, updatedClickedItems);
        } else {
            // If no date is selected, call ReadArticleData function with an empty date string and updated clickedItems array
            ReadArticleData('', updatedClickedItems);
        }
    };
    const handleSelectAll = () => {
        setIsThemeAll(true);
        setCurrentPage(0);
        setLoading(true);
        if (selectedDate !== null) {
            ReadArticleData(selectedDate, []);
        } else {
            ReadArticleData('', []);
        }
        let updatedClickedItems: string[] = themeList.map((theme: { theme_id: string }) => theme.theme_id);        
        setClickedItems(updatedClickedItems);
    };

    const handleLinkClick = (link:string) => {
        let userId = localStorage.getItem('userid');
        let userRole = localStorage.getItem('role');
        // creating log for article page visit.
        fetchApi('userPageLog').then(function (data) {
            let _date = new Date();
            let timeStamp = _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDate() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
            let csvContent = "";
            let _mainArray = [];

            if (data == null) {
                let csvArray = [
                    ['userid', 'userrole', 'page', 'activity', 'timestamp'],
                    [userId, userRole, link, 'redirect', timeStamp]
                ];

                csvArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\r\n";
                });
            }
            else {
                if (data.length > 0) {
                    let temp_array = data.split('\n');

                    if (temp_array.length > 0) {
                        temp_array.forEach(function (ra: any) {
                            let _subArray = ra.split(",");
                            _mainArray.push(_subArray);
                        });
                        _mainArray.push([userId, userRole, link, 'redirect', timeStamp]);
                    }

                }
                else {
                    _mainArray = [
                        ['userid', 'userrole', 'page', 'activity', 'timestamp'],
                        [userId, userRole, link, 'redirect', timeStamp]
                    ];

                }

                _mainArray.forEach(function (rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\n";
                });

            }

            fetch(`/api/write_csv?blobName=userPageLog.csv&overwriteCase=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/csv',
                },
                body: csvContent,
            }).then(function (response) {
                response.json().then(function (data) {
                    console.log(data.message);
                });
            });


        });
    };
    
    let isSelectAllTrue = false;
    if(clickedItems.length == themeList.length){
        isSelectAllTrue = true;
    }else{
        isSelectAllTrue = false;
    }

    interface IconExampleProps {
        article: any;
        likeActiveInitial: boolean;
        dislikeActiveInitial: boolean;
        handleLike: (article: any) => void;
        handleDislike: (article: any) => void;
      }
   
    const IconExample: React.FC<IconExampleProps> = ({
        article,
        likeActiveInitial,
        dislikeActiveInitial,
        handleLike,
        handleDislike,
      }) => {
        return (
          <div>
            <FontAwesomeIcon
              icon={faThumbsUp}
              onClick={() => handleLike(article)}
              style={{
                fontSize: '28px',
                cursor: likeActiveInitial ? 'not-allowed' : 'pointer',
                color: likeActiveInitial ? '#4CAF50' : '#ccc',
                marginRight: '16px',
                pointerEvents: likeActiveInitial ? 'none' : 'auto',
              }}
            />
            <FontAwesomeIcon
              icon={faThumbsDown}
              onClick={() => handleDislike(article)}
              style={{
                fontSize: '28px',
                cursor: dislikeActiveInitial ? 'not-allowed' : 'pointer',
                color: dislikeActiveInitial ? '#f44336' : '#ccc',
                marginBottom: '-8px',
                pointerEvents: dislikeActiveInitial ? 'none' : 'auto',
              }}
            />
          </div>
        );
    };
    interface StarRatingProps {
        initialRating?: number;
        onRatingChange?: (rating: number) => void;
    }
          
    const [rating, setRating] = useState<number>(0);
      
    const handleRating = async (ratingValue: number,initaialRatingForArticle:number, article: { themeTitle: any; feedID: any; themeId: any; feedTitle: string; article: string; ex_link: string;  isLike: boolean | "" | number }) => {
        setThemeId(article.themeId);
        setFeedId(article.feedID);
        let userId = localStorage.getItem('userid');
        let res = await ReadArticleList(selectedDate, clickedItems, userId);
        
        let actualRatingToSave = 0;
        if (initaialRatingForArticle === ratingValue) {
            actualRatingToSave = 0;
            setRating(0);
            // if (onRatingChange) {
            //     onRatingChange(0);
            // }
        } 
        else {
            actualRatingToSave = ratingValue;
            setRating(ratingValue);
            // if (onRatingChange) {
            //     onRatingChange(ratingValue);
            // }
        }
        
        SetMatchingFeedback(article.themeId, article.feedID, actualRatingToSave, res, userId, selectedDate);
    };
    function SetUserArticleRating(ratingNo: number){
        setRating(ratingNo);
    }

    return (
        <div>
            <div className={`card ${themeStyleCom.custom_style}`}>
                <div className="card-body">
                    <ReactDatePicker
                        className={`datepickerCustomStyle ${themeStyleCom.datepickerCustomStyle} ${themeStyleCom.datePickerAlginment}`}
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                            // Check if date is not null before passing it to onDateChange
                            if (date !== null) {
                                onDateChange(date);
                            }
                        }}
                        dateFormat='yyyy-MM-dd'
                        excludeDates={disabledDate}
                        showIcon
                    />
                </div>
            </div>

            <br />

            {loading ? (
                <Loader /> // Show Loader if loading is true
            ) :
                (
                    <div className="row">
                        <div className="theme_list col-3" style={{ backgroundColor: '#f1f1f1' }}>
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1" style={{ marginTop: '9px' }}>
                                    <h6 id="article_heading" className="mb-0 text-left">{t("page.users.article.theme_section_header")}</h6>
                                </div>
                                {theme_list.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ marginTop: '9px' }}>
                                        {isThemeSelectAll || isSelectAllTrue ? (
                                            <button onClick={handleClear} className="btn btn-link text-danger d-flex align-items-center shadow-none text-left" style={{ fontSize: '12px', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                                                {t("page.users.article.unselect_all")}
                                            </button>
                                        ) : (
                                            <button onClick={handleSelectAll} className="btn btn-link text-primary d-flex align-items-center shadow-none text-left" style={{ fontSize: '12px', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                                                {t("page.users.article.select_all")}
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>

                            {theme_list.length === 0 ? (
                                <div style={{ marginBottom: '14px' }}>{t("page.users.article.no_theme")}</div>
                            ) : (
                                <>
                                    {theme_list.map(themes => (
                                        <div key={themes.theme_id} className={`${themeStyleCom.question_container}`} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px', padding: '20px', marginBottom: '20px', backgroundColor: isThemeSelectAll || clickedItems.includes(themes.theme_id as never) ? 'antiquewhite' : '#f9f9f9' }} onClick={() => handleClick(themes.theme_id)}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <input type="checkbox" checked={(clickedItems.includes(themes.theme_id as never) || isThemeSelectAll)} onChange={() => handleClick(themes.theme_id)} />
                                                <div style={{ marginLeft: '10px' }}>
                                                    <h6 className="card-title text-success question_title">{themes.theme_title}</h6>
                                                    <p style={{ fontSize: '14px' }}>{themes.themeTag}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                        <div className="theme_list col-9" style={{ backgroundColor: '#e1e1e1' }}>
                            <h6 id="article_heading" style={{ marginTop: '9px' }}>{t("page.users.article.article_section_header")}</h6>
                            {currentItems.length === 0 || (!isThemeSelectAll && clickedItems.length == 0) ? (
                                <div>{t("page.users.article.no_article")}</div>
                            ) : (
                                <>
                                    {currentItems.map((article: { themeTitle: any; feedID: any; themeId: any; feedTitle: string; article: string; ex_link: string; isLike: boolean | "" | number }, index: number) => {
                                        // let likeActiveInitial = article.isLike === true || likeActive;
                                        // let likeActiveInitial = false;

                                        // // if((article.isLike || (likeActive && likedThemeId==article.themeId && likedFeedId==article.feedID)) && !(dislikeActive && likedThemeId==article.themeId && likedFeedId==article.feedID)){
                                        // if (article.isLike || (likeActive && likedThemeId == article.themeId && likedFeedId == article.feedID)) {
                                        //     // if(isLiked !=''){
                                        //     //     if(isLiked=='true'){
                                        //     //         likeActiveInitial = true;    
                                        //     //     }else{
                                        //     //         likeActiveInitial = false;
                                        //     //     }
                                        //     // }else{
                                        //     //     likeActiveInitial = true;
                                        //     // }                                        
                                        //     likeActiveInitial = true;
                                        // } else {
                                        //     likeActiveInitial = false;
                                        // }

                                        // // let dislikeActiveInitial = article.isLike === false || dislikeActive;
                                        // let dislikeActiveInitial = false;
                                        // // if((article.isLike=== false || (dislikeActive && likedThemeId==article.themeId && likedFeedId==article.feedID)) && !(likeActive && likedThemeId==article.themeId && likedFeedId==article.feedID)){
                                        // if (article.isLike === false || (dislikeActive && likedThemeId == article.themeId && likedFeedId == article.feedID)) {
                                        //     // if(isLiked !=''){
                                        //     //     if(isLiked =='false'){
                                        //     //         dislikeActiveInitial = true;
                                        //     //     }else{
                                        //     //         dislikeActiveInitial = false;
                                        //     //     }
                                        //     // }else{
                                        //     //     dislikeActiveInitial = true;
                                        //     // }                                        
                                        //     dislikeActiveInitial = true;
                                        // } else {
                                        //     dislikeActiveInitial = false;
                                        // }

                                        // if (likedThemeId == article.themeId && likedFeedId == article.feedID) {
                                        //     if (isLiked) {
                                        //         likeActiveInitial = true;
                                        //     } else {
                                        //         likeActiveInitial = false;
                                        //     }

                                        //     if (isDisliked) {
                                        //         dislikeActiveInitial = true;
                                        //     } else {
                                        //         dislikeActiveInitial = false;
                                        //     }
                                        // }
                                        
                                        //Rating system       
                                        let initaialRatingForArticle = 0;        
                                        // if (parsboolean(article.isLike) === true || article.isLike === false || article.isLike === '') {
                                        //     initaialRatingForArticle = 0;
                                        // } else {
                                        //     initaialRatingForArticle = article.isLike;
                                        // }

                                        if (article.isLike === true || article.isLike === false || article.isLike === '') {
                                            initaialRatingForArticle = 0;
                                        } else if (article.isLike > 0) {
                                            initaialRatingForArticle = article.isLike;
                                        } else {
                                            initaialRatingForArticle = 0; // Default case for other unexpected values
                                        }                                                                              

                                        if (likedThemeId == article.themeId && likedFeedId == article.feedID) {
                                            initaialRatingForArticle = rating;
                                        }                
                                        return (
                                            <div className={`${themeStyleCom.question_container}`} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px', padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }} key={index}>
                                                <div>
                                                    <h6 className="card-title text-success question_title">{article.feedTitle}</h6>
                                                    <p dangerouslySetInnerHTML={{ __html: article.article }} style={{ fontSize: '14px' }}></p>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">                                                    
                                                    <>
                                                    <div className="d-flex align-items-center">
                                                    {(clickedItems.length === 1 || theme_list.length === 1) && (
                                                        
                                                        <div style={{ display: 'flex' }}>
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                            <FontAwesomeIcon
                                                                key={star}
                                                                icon={faStar}
                                                                onClick={() => handleRating(star, initaialRatingForArticle, article)}
                                                                style={{
                                                                fontSize: '20px',
                                                                cursor: 'pointer',
                                                                color: star <= initaialRatingForArticle ? '#FFD700' : '#ccc',
                                                                marginRight: '8px',
                                                                }}
                                                            />
                                                            
                                                            ))}
                                                        </div>
                                                        
                                                    )}
                                                    </div>
                                                    </>
                                                    <a href={article.ex_link} onClick={()=>handleLinkClick(article.ex_link)} target="_blank" className="read-more-link" style={{ fontSize: '14px' }}>{t("page.users.article.read_more")}...</a>
                                                </div>
                                            </div>

                                        );
                                    })}
                                    <Paginations
                                        currentItems={currentItems}
                                        itemsPerPage={itemsPerPage}
                                        handleItemsPerPageChange={handleItemsPerPageChange}
                                        handlePageChange={handlePageChange}
                                        totalPages={totalPages}
                                        MAX_VISIBLE_PAGES={MAX_VISIBLE_PAGES}
                                    />
                                </>
                            )}
                            <br />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Articles;

async function fetchApi(pageName:string) {
    const response = await fetch(`/api/read_csv?blobName=${pageName}.csv`);
    const result = await response.json();
    const data = await result.message;
    return data;
}

function GetCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to get the correct month (January is 0)
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    return formattedDate;
}

function GetSelectedDate(date: any) {
    const givenDate = new Date(date);
    const dateString = givenDate.toLocaleDateString('en-GB');
    const formattedDate = dateString.split('/').join('-');
    const parts = formattedDate.split('-');
    const convertedDate = parts[2] + parts[1] + parts[0];

    return convertedDate;
}
//READ ARTICLE LIST FROM BLOB 
async function ReadUserWiseArticleBlob(date: any, clickedItems: any, userId: any) {
    try {
        let artileBlobName: any = '';

        if (date !== '') {
            let convertedDate = GetSelectedDate(date)
            artileBlobName = `user_article_${convertedDate}.json`;
        } else {
            let currentDate = GetCurrentDate();
            artileBlobName = `user_article_${currentDate}.json`;
        }
        //let articleRes = await readBlob(artileBlobName); 
        //BLOB START
        const articleRes = await fetch(`/api/blob/read?blobName=${artileBlobName}`);
        const result = await articleRes.json();

        if (result.error == 'Blob not found') {
            themeList = [];
            articleList = [];
        }
        else {

            const jsonString = result.message;
            let data = JSON.parse(jsonString);
            //check if the date wise article has found, if found then go for the further process.
            if (typeof jsonString !== 'undefined') {
                //const jsonString = articleRes.data.message;  
                data = JSON.parse(jsonString);  
                let convertedDatas = [];

                if(typeof data == 'string'){
                    convertedDatas = JSON.parse(data);
                }else{
                    convertedDatas = data;
                }                     

                let userWiseRes: any = [];
                let isUserFound: boolean = false;

                if (convertedDatas.length === 0) {
                    console.log('convertedData is empty.');
                } else {
                    // console.log('typeof jsonString: ',typeof convertedDatas);
                    // console.log('convertedDatas: ',convertedDatas);
                    
                    // convertedDatas.forEach((convertedData: { [x: string]: any; }) => {
                    //     // Assuming userId is defined elsewhere
                    //     if (convertedData[userId]) {
                    //         isUserFound = true;
                    //         userWiseRes = convertedData[userId];
                    //     } else {
                    //         console.log('Node "userId" does not exist.');
                    //         themeList = [];
                    //         articleList = [];
                    //     }
                    // });
                    // console.log('isArray: ',Array.isArray(convertedDatas));
                    if (Array.isArray(convertedDatas)){
                        convertedDatas.forEach((convertedData: { [x: string]: any; }) => {
                            // Assuming userId is defined elsewhere
                            if (convertedData[userId]) {
                                isUserFound = true;
                                userWiseRes = convertedData[userId];
                            } else {
                                console.log('Node "userId" does not exist.');
                                themeList = [];
                                articleList = [];
                            }
                        });
                    }
                    else{
                        Object.entries(convertedDatas).forEach(([key, convertedData]) => {
                            console
                            if (key === userId) {
                                isUserFound = true;                                
                                userWiseRes = convertedData;                                                                
                            }else {
                                console.log('Node "userId" does not exist.');
                                themeList = [];
                                articleList = [];
                            }
                        });
                        if(isUserFound){
                            const mappedThemes = Object.entries(userWiseRes).map(([themeId, theme]) => {
                                const typedTheme = theme as {
                                    user_id: string;
                                    theme_id: string;
                                    themeTag: string;
                                    theme_title: string;
                                    theme_Request: string;
                                    theme_Site: string;
                                    article: {
                                        bestMatch: Array<{
                                            feedID: string | number;
                                            feedTitle: string;
                                            article: string;
                                            ex_link: string;
                                            isLike: string;
                                        }>;
                                        avgMatch: Array<{
                                            feedID: string | number;
                                            feedTitle: string;
                                            article: string;
                                            ex_link: string;
                                            isLike: string;
                                        }>;
                                    };
                                    created_at: string;
                                    updated_at: string;
                                    deleted_at: string;
                                };
                            
                                return {
                                    [themeId]: {
                                        theme_id: typedTheme.theme_id,
                                        themeTag: typedTheme.themeTag,
                                        theme_title: typedTheme.theme_title,
                                        theme_Request: typedTheme.theme_Request,
                                        theme_Site: typedTheme.theme_Site,
                                        article: {
                                            bestMatch: typedTheme.article.bestMatch,
                                            avgMatch: typedTheme.article.avgMatch
                                        },
                                        created_at: typedTheme.created_at,
                                        updated_at: typedTheme.updated_at,
                                        deleted_at: typedTheme.deleted_at
                                    }
                                };
                            });
                            
                            console.log(mappedThemes);
                            userWiseRes = mappedThemes;
                        }
                    }
                    
                }                
                console.log('userWiseRes10: ',userWiseRes);

                let articles: any = [];
                articles = userWiseRes;                
                //CREATE THEME LIST
                themeList = [];
                if (isUserFound) {
                    console.log('userWiseRes: ',userWiseRes);
                    for (const themeKey in userWiseRes) {
                        if (userWiseRes.hasOwnProperty(themeKey)) {
                            const theme = userWiseRes[themeKey];
                            let parentKey: string | undefined = Object.keys(theme)[0];
                            let parentTheme = theme[parentKey];

                            const themeObj = {
                                "theme_id": parentTheme.theme_id,
                                "themeTag": parentTheme.themeTag,
                                "theme_title": parentTheme.theme_title,
                                "theme_Request": parentTheme.theme_Request
                            };
                            themeList.push(themeObj);
                        }
                    }
                    const clickedItemsLength: number = clickedItems.length;

                    if (clickedItemsLength > 0) {
                        const filteredData = userWiseRes.filter((item: {}) => clickedItems.includes(Object.keys(item)[0]));
                        articles = filteredData;
                    }

                    //CREATE ARTICLE LIST
                    interface Article {
                        feedID: any;
                        feedTitle: any;
                        article: any;
                        ex_link: any;
                    }



                    articleList = [];
                    for (const themeKey in articles) {
                        if (articles.hasOwnProperty(themeKey)) {
                            const theme = articles[themeKey];
                            if (theme && theme[Object.keys(theme)[0]] && theme[Object.keys(theme)[0]].article) {
                                const { bestMatch, avgMatch } = theme[Object.keys(theme)[0]].article;
                                let themeId = theme[Object.keys(theme)[0]].theme_id;
                                let themeTitle = theme[Object.keys(theme)[0]].theme_title;

                                // Iterate over articles under bestMatch
                                bestMatch.forEach((article: {
                                    isLike: any; feedID: any; feedTitle: any; article: any; ex_link: any;
                                }) => {
                                    const articleObj = {
                                        "themeTitle": themeTitle,
                                        "themeId": themeId,
                                        "feedID": article.feedID,
                                        "feedTitle": article.feedTitle,
                                        "article": article.article,
                                        "ex_link": article.ex_link,
                                        "isLike": article.isLike
                                    };
                                    //articleList.push(articleObj);
                                    articleList.push(articleObj);
                                });

                                // Iterate over articles under avgMatch
                                // avgMatch.forEach((article: { feedID: any; feedTitle: any; article: any; ex_link: any; }) => {
                                //     const articleObj = {
                                //         "feedID": article.feedID,
                                //         "feedTitle": article.feedTitle,
                                //         "article": article.article,
                                //         "ex_link": article.ex_link
                                //     };
                                //     articleList.push(articleObj);
                                // });
                            }


                            // // Articles under bestMatch
                            // theme.article.bestMatch.forEach((article: { feedID: any; feedTitle: any; article: any; ex_link: any; }) => {
                            //     const articleObj = {
                            //         "feedID": article.feedID,
                            //         "feedTitle": article.feedTitle,
                            //         "article": article.article,
                            //         "ex_link": article.ex_link
                            //     };
                            //     articleList.push(articleObj);
                            // });

                            // // Articles under avgMatch
                            // theme.article.avgMatch.forEach((article: { feedID: any; feedTitle: any; article: any; ex_link: any; }) => {
                            //     const articleObj = {
                            //         "feedID": article.feedID,
                            //         "feedTitle": article.feedTitle,
                            //         "article": article.article,
                            //         "ex_link": article.ex_link
                            //     };
                            //     articleList.push(articleObj);
                            // });
                        }
                    }
                    console.log('articleList: ',articleList);
                    console.log('articles: ',articles);
                    const uniqueFeedIDs = new Set();
                    // Filter articleList to include only unique feedIDs                    

                    const uniqueArticles: Article[] = articleList.filter((article: Article) => {
                        // Check if the feedID is not in the Set
                        if (!uniqueFeedIDs.has(article.feedID)) {
                            // If not, add it to the Set and return true to keep this article
                            uniqueFeedIDs.add(article.feedID);
                            return true;
                        }
                        // If the feedID is already in the Set, return false to exclude this article
                        return false;
                    });
                    articleList.length = 0;
                    //articleList.push(uniqueArticles);
                    articleList.push(...uniqueArticles);
                } else {
                    themeList = [];
                    articleList = [];
                }
            } else {
                themeList = [];
                articleList = [];
            }
        }
    } catch (error: any) {
        console.error("Error: ", error.message);
        return false
    }
}

//********AZURE BLOB STORAGE SERVICE*********//
let blobName_Tags: string = '';
let allTags: any = [];

//READ ALL TAGS
async function ReadTags() {
    if (blobName_Tags == '') {
        blobName_Tags = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME || '';
        //blobName_Tags = process.env.NEXT_PUBLIC_USER_THEME_BLOB_NAME || '';
    }
    const response = await fetch(`/api/blob/read?blobName=${blobName_Tags}`);
    const result = await response.json();
    const jsonString = result.message;
    interface ParsedData {
        [key: string]: { isActive: boolean };
    }
    const parsedData: ParsedData = JSON.parse(jsonString);
    //STORE THE RESPONSE INTO GLOBAL VARIABLE
    allTags = parsedData;

    const filteredTagList: ParsedData = Object.fromEntries(
        Object.entries(parsedData).filter(([tag, data]: [string, { isActive: boolean }]) => data.isActive === true)
    );
    return filteredTagList;
};

//READ TAG WISE QUESTIONS
async function ReadQuestions(qTagName: string) {
    try {

        if (allTags == '') {
            blobName_Tags = process.env.NEXT_PUBLIC_ADMIN_TAG_BLOB_NAME || '';
            let response = await fetch(`/api/blob/read?blobName=${blobName_Tags}`) || [];
            const result = await response.json();
            const jsonString = result.message;
            const parsedData = JSON.parse(jsonString);
            allTags = parsedData;
        }

        if (allTags && allTags[qTagName]) {
            const filteredRes = allTags[qTagName];

            const resJson = JSON.stringify(filteredRes, null, 2)
            return resJson;
        }
        else {
            return [];
        }
    } catch (error: any) {
        console.error("Error: ", error.message);
        return false
    }
}

//Write User input into blob 
async function UserFeedback_Article(userThemeId: any, userFeedId: any, isLike: any, usersArticle: any, user_id: any, date: any) {
    // Iterate over the usersArticle array
    const updatedUsersArticle: any = usersArticle.map((userArticles: { [s: string]: unknown; } | ArrayLike<unknown>) => {
        return Object.entries(userArticles).reduce((acc: any, [userId, articles]) => {
            if (userId === user_id) {
                const updatedArticles: any = (articles as any[]).map((article) => {
                    const themeId = Object.keys(article)[0];
                    if (themeId === userThemeId) {
                        const articleData: any = Object.values(article)[0];
                        if (articleData.article.bestMatch) {

                            articleData.article.bestMatch.forEach((match: { feedID: any; isLike: any; }) => {
                                if (match.feedID === userFeedId) {
                                    match.isLike = isLike;
                                }
                            });
                        }
                        if (articleData.article.avgMatch) {
                            articleData.article.avgMatch.forEach((match: { feedID: any; isLike: any; }) => {
                                if (match.feedID === userFeedId) {
                                    match.isLike = isLike;
                                }
                            });
                        }
                    }
                    return article;
                });
                acc[userId] = updatedArticles;
            } else {
                acc[userId] = articles;
            }
            return acc;
        }, {});
    });

    let artileBlobName: any = '';
    if (date !== '') {
        let convertedDate = GetSelectedDate(date)
        artileBlobName = `user_article_${convertedDate}.json`;
    } else {
        let currentDate = GetCurrentDate();
        artileBlobName = `user_article_${currentDate}.json`;
    }


    try {
        const response = await fetch(`/api/blob/write?blobName=${artileBlobName}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUsersArticle),
        });
        // if(isGenerated)  {
        //     alert('Update Successfully');
        // }else{
        //     alert('Save Successfully');
        // }        
    } catch (error) {
        return false
    }
}

//READ ARTICLE LIST FROM BLOB 
async function ReadArticleList(date: any, clickedItems: any, userId: any) {
    try {
        let artileBlobName: any = '';

        if (date !== '') {
            let convertedDate = GetSelectedDate(date)
            artileBlobName = `user_article_${convertedDate}.json`;
        } else {
            let currentDate = GetCurrentDate();
            artileBlobName = `user_article_${currentDate}.json`;
        }
        //BLOB START
        const articleRes = await fetch(`/api/blob/read?blobName=${artileBlobName}`);
        const result = await articleRes.json();

        if (result.error == 'Blob not found') {
            themeList = [];
            articleList = [];
        }
        else {

            const jsonString = result.message;
            let data = JSON.parse(jsonString);
            //check if the date wise article has found, if found then go for the further process.                                
            if (typeof data !== 'undefined') {      
                         
                let convertedDatas = [];               
                
                if(typeof data == 'string'){                    
                    convertedDatas = JSON.parse(data);                    
                    if(typeof convertedDatas == 'string'){
                        convertedDatas = JSON.parse(convertedDatas);
                    }
                }else{                    
                    convertedDatas = data;
                }                  
             
                // const convertedDatas = JSON.parse(data);
                //const convertedDatas = JSON.parse(jsonString);                   

                return convertedDatas;
            } else {
                themeList = [];
                articleList = [];
            }
        }
    } catch (error: any) {
        console.error("Error: ", error.message);
        return false
    }
}
async function SetMatchingFeedback(userThemeId: any, userFeedId: any, ratingPoints: any, usersArticle: any, user_id: any, date: any) {   
    // Iterate over the usersArticle array
    const updatedUsersArticle: any = usersArticle.map((userArticles: { [s: string]: unknown; } | ArrayLike<unknown>) => {
        return Object.entries(userArticles).reduce((acc: any, [userId, articles]) => {
            if (userId === user_id) {
                const updatedArticles: any = (articles as any[]).map((article) => {
                    const themeId = Object.keys(article)[0];
                    if (themeId === userThemeId) {
                        const articleData: any = Object.values(article)[0];
                        if (articleData.article.bestMatch) {

                            articleData.article.bestMatch.forEach((match: { feedID: any; isLike: any; }) => {
                                if (match.feedID === userFeedId) {
                                    match.isLike = ratingPoints;
                                }
                            });
                        }
                        if (articleData.article.avgMatch) {
                            articleData.article.avgMatch.forEach((match: { feedID: any; isLike: any; }) => {
                                if (match.feedID === userFeedId) {
                                    match.isLike = ratingPoints;
                                }
                            });
                        }
                    }
                    return article;
                });
                acc[userId] = updatedArticles;
            } else {
                acc[userId] = articles;
            }
            return acc;
        }, {});
    });

    let artileBlobName: any = '';
    if (date !== '') {
        let convertedDate = GetSelectedDate(date)
        artileBlobName = `user_article_${convertedDate}.json`;
    } else {
        let currentDate = GetCurrentDate();
        artileBlobName = `user_article_${currentDate}.json`;
    }   

    try {
        const response = await fetch(`/api/blob/write?blobName=${artileBlobName}&overwriteCase=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUsersArticle),
        });
        // if(isGenerated)  {
        //     alert('Update Successfully');
        // }else{
        //     alert('Save Successfully');
        // }        
    } catch (error) {
        return false
    }
}