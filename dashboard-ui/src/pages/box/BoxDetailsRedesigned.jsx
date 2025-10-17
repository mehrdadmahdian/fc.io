import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import ModernContainer from '../../components/layout/ModernContainer';
import MarkdownContent from '../../components/common/MarkdownContent';
import BoxSelectionModal from '../../components/dashboard/cards/BoxSelectionModal';
import ProgressResetModal from '../../components/dashboard/cards/ProgressResetModal';
import BoxEditModal from '../../components/social/BoxEditModal';
import StatusFilter from '../../components/ui/StatusFilter';
import ActionsMenu from '../../components/ui/ActionsMenu';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../contexts/ToastContext';
import { 
    Plus, 
    PlusCircle, 
    Play, 
    Presentation, 
    RotateCcw, 
    CheckSquare, 
    X, 
    Search,
    Edit,
    ArrowLeft,
    MoreHorizontal,
    Save,
    Edit2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

function BoxDetailsRedesigned() {
    const { t } = useTranslation();
    const { boxId } = useParams();
    const location = useLocation();
    const { api } = useAuth();
    const { success, error: showError } = useToast();
    
    // State management
    const [loading, setLoading] = useState(true);
    const [box, setBox] = useState(null);
    const [cards, setCards] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [error, setError] = useState('');
    
    // Pagination (server-side)
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(10);
    const [totalCards, setTotalCards] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Inline editing
    const [editingCard, setEditingCard] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef(null);
    
    // New card creation
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [newCardData, setNewCardData] = useState({
        front: '',
        back: '',
        extra: '',
        hint: ''
    });
    
    // Card migration
    const [selectedCards, setSelectedCards] = useState(new Set());
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
    const [migrationCardIds, setMigrationCardIds] = useState([]);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    
    // Progress reset
    const [isProgressResetModalOpen, setIsProgressResetModalOpen] = useState(false);
    const [resetType, setResetType] = useState('card'); // 'card', 'box', 'bulk'
    const [showBoxEditModal, setShowBoxEditModal] = useState(false);
    const [resetCardIds, setResetCardIds] = useState([]);

    // All the existing functions would go here - I'll just include key ones for demonstration
    
    const getCardStatusBadge = (card) => {
        if (!card.Review) return { variant: "secondary", label: t('cards.new') };
        if (card.Review.ReviewsCount === 0) return { variant: "secondary", label: t('cards.new') };
        if (card.Review.NextDueDate === null) return { variant: "outline", label: t('cards.archived') };
        if (card.Review.Interval < 7) return { variant: "default", label: t('cards.learning') };
        return { variant: "default", label: t('cards.review') };
    };

    const getCardStatusIcon = (card) => {
        if (!card.Review) return { icon: 'fas fa-circle', color: '#10b981', title: t('cards.new') };
        if (card.Review.ReviewsCount === 0) return { icon: 'fas fa-circle', color: '#10b981', title: t('cards.new') };
        if (card.Review.NextDueDate === null) return { icon: 'fas fa-archive', color: '#6b7280', title: t('cards.archived') };
        if (card.Review.Interval < 7) return { icon: 'fas fa-clock', color: '#f59e0b', title: t('cards.learning') };
        return { icon: 'fas fa-sync', color: '#3b82f6', title: t('cards.review') };
    };


    // Placeholder functions - in real implementation, these would be the same as the original
    const fetchBoxData = useCallback(async () => {
        // Implementation would be the same as original
        setLoading(false);
        setBox({ Name: "Sample Box", Description: "Sample Description" });
        setCards([]);
        setTotalCards(0);
    }, []);

    const startCreatingCard = () => setIsCreatingCard(true);
    const toggleBulkSelectMode = () => setBulkSelectMode(!bulkSelectMode);
    const toggleCardSelection = (cardId) => {
        setSelectedCards(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(cardId)) {
                newSelection.delete(cardId);
            } else {
                newSelection.add(cardId);
            }
            return newSelection;
        });
    };
    const formatTimestamp = (timestamp) => 'Just now';
    const renderEditableField = (card, field) => <span>Sample field</span>;
    const handleSingleCardMigration = () => {};
    const handleSingleCardReset = () => {};
    const handleArchiveCard = () => {};
    const handleDeleteCard = () => {};
    const handleBulkMigration = () => {};
    const handleBulkReset = () => {};
    const handleBoxReset = () => {};
    const selectAllCards = () => {};
    const clearSelection = () => {};

    // Debounce search query to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchBoxData();
    }, [fetchBoxData]);

    const currentCards = cards;
    const indexOfFirstCard = (currentPage - 1) * cardsPerPage;
    const indexOfLastCard = Math.min(indexOfFirstCard + cards.length, totalCards);

    if (loading) {
        return (
            <ModernContainer>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">{t('common.loading')}</p>
                    </div>
                </div>
            </ModernContainer>
        );
    }

    if (error) {
        return (
            <ModernContainer>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                    <X className="h-6 w-6 text-destructive" />
                                </div>
                                <h3 className="mt-2 text-lg font-semibold">{t('common.error')}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ModernContainer>
        );
    }

    return (
        <ModernContainer>
            <div className="min-h-screen bg-background">
                {/* Fixed Title Bar */}
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center gap-4 px-4">
                        <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            className="shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex flex-col min-w-0 flex-1">
                            <h1 className="text-xl font-semibold truncate">
                                {box?.Name || t('boxDetails.title')}
                            </h1>
                            {box?.Description && (
                                <p className="text-sm text-muted-foreground truncate">
                                    {box.Description}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBoxEditModal(true)}
                            >
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline-block ml-2">{t('boxDetails.editBox')}</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="container px-4 py-6 space-y-6">
                    {/* Action Buttons */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    <Button 
                                        onClick={startCreatingCard} 
                                        disabled={isCreatingCard}
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('cards.addQuick')}
                                    </Button>
                                    
                                    <Button 
                                        asChild
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Link 
                                            to={`/box/${boxId}/cards/create`} 
                                            state={{ from: location.pathname }}
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            {t('cards.addDetailed')}
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        asChild
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Link to={`/box/${boxId}/review`}>
                                            <Play className="h-4 w-4" />
                                            {t('review.start')}
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        asChild
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Link to={`/box/${boxId}/presentation`}>
                                            <Presentation className="h-4 w-4" />
                                            {t('presentation.start')}
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        onClick={handleBoxReset}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        {t('progress_reset.box_reset')}
                                    </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <Button 
                                        onClick={toggleBulkSelectMode}
                                        variant={bulkSelectMode ? "default" : "outline"}
                                        size="sm"
                                    >
                                        {bulkSelectMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                                        {bulkSelectMode ? t('cards.exitBulkSelect') : t('cards.bulkSelect')}
                                    </Button>
                                    
                                    {bulkSelectMode && (
                                        <>
                                            <Button 
                                                onClick={selectAllCards}
                                                variant="outline"
                                                size="sm"
                                                disabled={selectedCards.size === currentCards.length}
                                            >
                                                {t('cards.selectAll')}
                                            </Button>
                                            
                                            <Button 
                                                onClick={clearSelection}
                                                variant="outline"
                                                size="sm"
                                                disabled={selectedCards.size === 0}
                                            >
                                                {t('cards.clearSelection')}
                                            </Button>
                                            
                                            {selectedCards.size > 0 && (
                                                <>
                                                    <Button 
                                                        onClick={handleBulkMigration}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        {t('migration.migrateSelected', { count: selectedCards.size })}
                                                    </Button>
                                                    <Button 
                                                        onClick={handleBulkReset}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        {t('progress_reset.bulk_reset')} ({selectedCards.size})
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search and Filter Bar */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">{totalCards}</span> {t('cards.total')}
                                        {selectedCards.size > 0 && (
                                            <>
                                                {' • '}
                                                <span className="font-medium text-primary">{selectedCards.size}</span> {t('cards.selected')}
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 sm:w-80">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder={t('cards.searchPlaceholder')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                        {searchQuery && (
                                            <Button 
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <StatusFilter 
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cards Display */}
                    {totalCards === 0 && !isCreatingCard ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <Search className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">
                                    {searchQuery ? t('cards.noSearchResults') : t('cards.noCards')}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {searchQuery 
                                        ? t('cards.tryDifferentSearch')
                                        : (statusFilter && statusFilter !== 'all')
                                            ? t('cards.noCardsWithFilter')
                                            : t('cards.createFirstDescription')
                                    }
                                </p>
                                {!searchQuery && (!statusFilter || statusFilter === 'all') && (
                                    <div className="mt-6 flex gap-2">
                                        <Button 
                                            onClick={startCreatingCard} 
                                            disabled={isCreatingCard}
                                        >
                                            <Plus className="h-4 w-4" />
                                            {t('cards.addQuick')}
                                        </Button>
                                        <Button 
                                            asChild
                                            variant="outline"
                                        >
                                            <Link 
                                                to={`/box/${boxId}/cards/create`} 
                                                state={{ from: location.pathname }}
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                                {t('cards.addDetailed')}
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {currentCards.map(card => {
                                const statusBadge = getCardStatusBadge(card);
                                return (
                                    <Card key={card.ID} className={`transition-colors hover:shadow-md ${selectedCards.has(card.ID) ? 'ring-2 ring-primary' : ''}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                {/* Selection Checkbox */}
                                                {bulkSelectMode && (
                                                    <div className="flex items-center pt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCards.has(card.ID)}
                                                            onChange={() => toggleCardSelection(card.ID)}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Card Content */}
                                                <div className="flex-1 min-w-0 space-y-4">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between">
                                                        {(() => {
                                                            const statusInfo = getCardStatusIcon(card);
                                                            return (
                                                                <span 
                                                                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs bg-gray-100 transition-all hover:scale-110"
                                                                    title={statusInfo.title}
                                                                    style={{ color: statusInfo.color }}
                                                                >
                                                                    <i className={statusInfo.icon}></i>
                                                                </span>
                                                            );
                                                        })()}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTimestamp(card.UpdatedAt)}
                                                            </span>
                                                            <ActionsMenu
                                                                buttonContent={<MoreHorizontal className="h-4 w-4" />}
                                                                buttonClassName="h-8 w-8 p-0"
                                                                actions={[
                                                                    {
                                                                        id: 'edit',
                                                                        label: t('cards.edit'),
                                                                        icon: 'fa-edit',
                                                                        onClick: () => {
                                                                            window.location.href = `/dashboard/box/${boxId}/cards/${card.ID}/edit`;
                                                                        }
                                                                    },
                                                                    {
                                                                        id: 'migrate',
                                                                        label: t('migration.move_to_box'),
                                                                        icon: 'fa-arrow-right',
                                                                        onClick: () => handleSingleCardMigration(card.ID)
                                                                    },
                                                                    {
                                                                        id: 'reset',
                                                                        label: 'Reset',
                                                                        icon: 'fa-undo-alt',
                                                                        onClick: () => handleSingleCardReset(card.ID)
                                                                    },
                                                                    {
                                                                        id: 'archive',
                                                                        label: t('cards.archive'),
                                                                        icon: 'fa-archive',
                                                                        onClick: () => handleArchiveCard(card.ID)
                                                                    },
                                                                    { divider: true },
                                                                    {
                                                                        id: 'delete',
                                                                        label: t('cards.delete'),
                                                                        icon: 'fa-trash-alt',
                                                                        danger: true,
                                                                        onClick: () => handleDeleteCard(card.ID)
                                                                    }
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Card Fields */}
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                {t('cards.front')}
                                                            </div>
                                                            <div className="min-h-[2rem] group relative">
                                                                {renderEditableField(card, 'Front')}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                {t('cards.back')}
                                                            </div>
                                                            <div className="min-h-[2rem] group relative">
                                                                {renderEditableField(card, 'Back')}
                                                            </div>
                                                        </div>
                                                        
                                                        {(card.Extra || card.Hint) && (
                                                            <>
                                                                {card.Extra && (
                                                                    <div className="space-y-2">
                                                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                            {t('cards.extra')}
                                                                        </div>
                                                                        <div className="min-h-[2rem] group relative">
                                                                            {renderEditableField(card, 'Extra')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {card.Hint && (
                                                                    <div className="space-y-2">
                                                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                            {t('cards.hint')}
                                                                        </div>
                                                                        <div className="min-h-[2rem] group relative">
                                                                            {renderEditableField(card, 'Hint')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Card>
                            <CardContent className="flex items-center justify-between px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    {t('pagination.showing', {
                                        start: indexOfFirstCard + 1,
                                        end: indexOfLastCard,
                                        total: totalCards
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => 
                                                page === 1 || 
                                                page === totalPages || 
                                                Math.abs(page - currentPage) <= 2
                                            )
                                            .map((page, index, array) => (
                                                <React.Fragment key={page}>
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <span className="px-2 text-muted-foreground">...</span>
                                                    )}
                                                    <Button
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className="w-10"
                                                    >
                                                        {page}
                                                    </Button>
                                                </React.Fragment>
                                            ))
                                        }
                                    </div>
                                    
                                    <Button
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            
            {/* Modals would go here */}
            {/* <BoxSelectionModal />, <ProgressResetModal />, <BoxEditModal /> */}
        </ModernContainer>
    );
}

export default BoxDetailsRedesigned;
