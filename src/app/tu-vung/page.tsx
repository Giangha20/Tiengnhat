'use client';

import { useState, useMemo, useCallback } from 'react';
import type { VocabularyData, VocabularyTopic, VocabularyWord } from '@/types';
import rawVocabData from '@/data/vocabulary/n5-vocabulary.json';
import { speak, isAudioSupported } from '@/lib/audio';
import { useProgress } from '@/components/providers/ProgressProvider';

const vocabData = rawVocabData as unknown as VocabularyData;
const topicsList: VocabularyTopic[] = vocabData.topics;

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'learned' | 'unlearned';

export default function TuVungPage() {
  const { progress, markItemLearned, getItemStatus, updateProgress } = useProgress();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedWordIds, setExpandedWordIds] = useState<Record<string, boolean>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Flatten all words with topic metadata for easy filtering
  const allWordsWithTopic = useMemo(() => {
    return topicsList.flatMap((topic: VocabularyTopic) =>
      topic.words.map((word: VocabularyWord) => ({
        ...word,
        topicId: topic.id,
        topicName: topic.name,
        topicNameJa: topic.nameJa,
      }))
    );
  }, []);

  // Filter words
  const filteredWords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allWordsWithTopic.filter((word) => {
      // Topic filter
      if (selectedTopicId !== 'all' && word.topicId !== selectedTopicId) {
        return false;
      }

      // Status filter
      const status = getItemStatus(word.id, 'vocabulary');
      const isLearned = status === 'learning' || status === 'reviewing' || status === 'mastered';
      if (statusFilter === 'learned' && !isLearned) {
        return false;
      }
      if (statusFilter === 'unlearned' && isLearned) {
        return false;
      }

      // Search query filter
      if (!query) return true;

      const matchWord = word.word.toLowerCase().includes(query);
      const matchReading = word.reading.toLowerCase().includes(query);
      const matchRomaji = word.romaji.toLowerCase().includes(query);
      const matchMeaning = word.meaning.toLowerCase().includes(query);
      const matchKanji = word.kanji ? word.kanji.toLowerCase().includes(query) : false;
      const matchExample = word.exampleVi.toLowerCase().includes(query) || word.exampleJa.toLowerCase().includes(query);

      return matchWord || matchReading || matchRomaji || matchMeaning || matchKanji || matchExample;
    });
  }, [allWordsWithTopic, selectedTopicId, statusFilter, searchQuery, getItemStatus]);

  // Pagination calculation
  const totalItems = filteredWords.length;
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const paginatedWords = useMemo(() => {
    if (itemsPerPage === 0) return filteredWords;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWords, currentPage, itemsPerPage]);

  // Reset to page 1 on search or filter change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Toggle card expansion
  const toggleExpand = useCallback((wordId: string) => {
    setExpandedWordIds((prev) => ({
      ...prev,
      [wordId]: !prev[wordId],
    }));
  }, []);

  // Expand all / Collapse all
  const toggleExpandAll = () => {
    const allExpanded = paginatedWords.every((w) => expandedWordIds[w.id]);
    const newState: Record<string, boolean> = {};
    if (!allExpanded) {
      paginatedWords.forEach((w) => {
        newState[w.id] = true;
      });
    }
    setExpandedWordIds(newState);
  };

  // Audio playback handler
  const playAudio = useCallback((id: string, textToSpeak: string) => {
    setAudioError(null);
    if (!isAudioSupported()) {
      setAudioError('Trình duyệt của bạn không hỗ trợ tính năng phát âm thanh.');
      return;
    }
    setPlayingAudioId(id);
    speak({
      text: textToSpeak,
      rate: 0.85,
      pitch: 1.0,
      onEnd: () => setPlayingAudioId(null),
      onError: (err) => {
        setAudioError(err);
        setPlayingAudioId(null);
      },
    });
  }, []);

  // Toggle bookmark / learned status
  const handleToggleLearned = useCallback(
    (wordId: string) => {
      const currentStatus = getItemStatus(wordId, 'vocabulary');
      const isAlreadyLearned = currentStatus !== 'new';

      if (!isAlreadyLearned) {
        markItemLearned(wordId, 'vocabulary');
      } else {
        // Remove from reviewQueue
        const newQueue = progress.reviewQueue.filter(
          (item) => !(item.itemId === wordId && item.itemType === 'vocabulary')
        );
        updateProgress({
          reviewQueue: newQueue,
          totalWordsLearned: Math.max(0, progress.totalWordsLearned - 1),
        });
      }
    },
    [getItemStatus, markItemLearned, progress.reviewQueue, progress.totalWordsLearned, updateProgress]
  );

  // Compute learned count among all words
  const learnedCount = useMemo(() => {
    return allWordsWithTopic.filter((w) => {
      const s = getItemStatus(w.id, 'vocabulary');
      return s !== 'new';
    }).length;
  }, [allWordsWithTopic, getItemStatus]);

  const progressPercent = Math.min(100, Math.round((learnedCount / vocabData.metadata.totalWords) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Overview */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {vocabData.metadata.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border">
                {vocabData.metadata.verificationStatus === 'reviewed' ? 'Đã biên soạn & kiểm duyệt' : 'Đã kiểm duyệt'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <span>{vocabData.metadata.title}</span>
              <span className="ja-text text-2xl text-muted-foreground font-normal">語彙</span>
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-2xl">
              {vocabData.metadata.description}
            </p>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-card border border-border rounded-xl p-4 min-w-[260px] shadow-sm">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground font-medium">Tiến độ ghi nhớ</span>
              <span className="font-bold text-foreground">
                {learnedCount} / {vocabData.metadata.totalWords} từ ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Mục tiêu N5</span>
              <span>{vocabData.topics.length} chủ đề</span>
            </div>
          </div>
        </div>

        {/* Audio Error Alert if any */}
        {audioError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-error/30 text-error text-sm flex items-center justify-between">
            <span>⚠️ {audioError}</span>
            <button
              onClick={() => setAudioError(null)}
              className="text-xs underline hover:opacity-80 ml-2"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Section */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo chữ Nhật, Hiragana, Romaji hoặc nghĩa tiếng Việt (VD: こんにちは, watashi, xin chào...)"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
              title="Xóa tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Topic Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chủ đề từ vựng
            </span>
            <span className="text-xs text-muted-foreground">
              {vocabData.topics.length} chủ đề có sẵn
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTopicChange('all')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                selectedTopicId === 'all'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              Tất cả ({allWordsWithTopic.length})
            </button>

            {vocabData.topics.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicChange(topic.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-foreground border-border hover:bg-secondary'
                  }`}
                >
                  <span>{topic.name}</span>
                  <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    ({topic.words.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Second Row: Status Filter + Layout Toggle + Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Trạng thái:
            </span>
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleStatusFilterChange('learned')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                statusFilter === 'learned'
                  ? 'bg-success text-white border-success'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <span>✓ Đã thuộc ({learnedCount})</span>
            </button>
            <button
              onClick={() => handleStatusFilterChange('unlearned')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === 'unlearned'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Chưa học ({vocabData.metadata.totalWords - learnedCount})
            </button>
          </div>

          {/* Controls: Expand all + Layout View toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleExpandAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              {paginatedWords.every((w) => expandedWordIds[w.id])
                ? 'Thu gọn tất cả'
                : 'Mở rộng tất cả chi tiết'}
            </button>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center rounded-lg border border-border p-0.5 bg-card">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-secondary text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Dạng lưới"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-secondary text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Dạng danh sách"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Hiển thị <strong className="text-foreground">{filteredWords.length}</strong> / {vocabData.metadata.totalWords} từ vựng
            {selectedTopicId !== 'all' && (
              <span> trong chủ đề <em>&quot;{vocabData.topics.find((t) => t.id === selectedTopicId)?.name}&quot;</em></span>
            )}
            {searchQuery && (
              <span> theo từ khóa &quot;{searchQuery}&quot;</span>
            )}
          </span>

          {(searchQuery || selectedTopicId !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopicId('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary Cards Display */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-semibold text-foreground">Không tìm thấy từ vựng phù hợp</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Không có từ vựng nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại. Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTopicId('all');
              setStatusFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Xem toàn bộ từ vựng
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedWords.map((word) => (
            <VocabularyCard
              key={word.id}
              word={word}
              isExpanded={!!expandedWordIds[word.id]}
              onToggleExpand={() => toggleExpand(word.id)}
              isPlaying={playingAudioId === `${word.id}-word`}
              isExamplePlaying={playingAudioId === `${word.id}-example`}
              onPlayAudio={(text) => playAudio(`${word.id}-word`, text)}
              onPlayExampleAudio={(text) => playAudio(`${word.id}-example`, text)}
              isLearned={getItemStatus(word.id, 'vocabulary') !== 'new'}
              onToggleLearned={() => handleToggleLearned(word.id)}
            />
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="space-y-3">
          {paginatedWords.map((word) => (
            <VocabularyListItem
              key={word.id}
              word={word}
              isExpanded={!!expandedWordIds[word.id]}
              onToggleExpand={() => toggleExpand(word.id)}
              isPlaying={playingAudioId === `${word.id}-word`}
              isExamplePlaying={playingAudioId === `${word.id}-example`}
              onPlayAudio={(text) => playAudio(`${word.id}-word`, text)}
              onPlayExampleAudio={(text) => playAudio(`${word.id}-example`, text)}
              isLearned={getItemStatus(word.id, 'vocabulary') !== 'new'}
              onToggleLearned={() => handleToggleLearned(word.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredWords.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị mỗi trang:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-card border border-border rounded-lg px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={12}>12 từ</option>
              <option value={24}>24 từ</option>
              <option value={48}>48 từ</option>
              <option value={0}>Tất cả ({filteredWords.length})</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
              >
                Trước
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show current page, edges, and adjacent pages
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="px-1 text-xs text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[34px] h-[34px] rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'bg-card text-foreground border border-border hover:bg-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
              >
                Sau
              </button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Subcomponent: Grid Card
// =========================================================================
interface WordCardProps {
  word: VocabularyWord & { topicName?: string; topicNameJa?: string };
  isExpanded: boolean;
  onToggleExpand: () => void;
  isPlaying: boolean;
  isExamplePlaying: boolean;
  onPlayAudio: (text: string) => void;
  onPlayExampleAudio: (text: string) => void;
  isLearned: boolean;
  onToggleLearned: () => void;
}

function VocabularyCard({
  word,
  isExpanded,
  onToggleExpand,
  isPlaying,
  isExamplePlaying,
  onPlayAudio,
  onPlayExampleAudio,
  isLearned,
  onToggleLearned,
}: WordCardProps) {
  return (
    <div
      className={`bg-card border rounded-xl transition-all duration-200 overflow-hidden shadow-sm flex flex-col ${
        isLearned ? 'border-success/40 bg-card' : 'border-border hover:border-primary/40'
      }`}
    >
      {/* Card Header & Main Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top meta tags */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                {word.wordType}
              </span>
              {word.topicName && (
                <span className="px-2 py-0.5 rounded text-xs text-muted-foreground bg-muted/60">
                  {word.topicName}
                </span>
              )}
            </div>

            {/* Bookmark / Learned Status Button */}
            <button
              onClick={onToggleLearned}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                isLearned
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
              }`}
              title={isLearned ? 'Đã thuộc từ này (Bấm để hủy)' : 'Đánh dấu đã thuộc từ này'}
              aria-label={isLearned ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
            >
              {isLearned ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Đã thuộc</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Chưa học</span>
                </>
              )}
            </button>
          </div>

          {/* Word & Reading Presentation */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="ja-text ja-large font-bold text-foreground leading-tight">
                {word.word}
              </h3>

              {/* Audio Button */}
              <button
                onClick={() => onPlayAudio(word.reading || word.word)}
                className={`p-2 rounded-full border transition-all flex items-center justify-center ${
                  isPlaying
                    ? 'bg-primary text-primary-foreground border-primary scale-110'
                    : 'bg-secondary text-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                }`}
                title="Nghe phát âm từ này"
                aria-label={`Nghe phát âm ${word.word}`}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Reading in Hiragana & Romaji */}
            <div className="flex items-center gap-2 mt-1">
              <span className="ja-text text-base font-semibold text-primary">
                {word.reading}
              </span>
              <span className="text-xs text-muted-foreground font-mono romaji-text">
                • {word.romaji}
              </span>
              {word.kanji && word.kanji !== word.word && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Kanji: {word.kanji}
                </span>
              )}
            </div>
          </div>

          {/* Meaning (Vietnamese) */}
          <div className="mt-2 text-base font-medium text-foreground">
            {word.meaning}
          </div>
        </div>

        {/* Action Toggle Footer */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium py-1"
          >
            <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem ví dụ & cách dùng'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <span className="text-muted-foreground">N5</span>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="px-4 pb-5 pt-3 bg-secondary/35 border-t border-border space-y-3.5 text-sm animate-fadeIn">
          {/* Usage explanation */}
          {word.usage && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                Cách dùng:
              </div>
              <p className="text-foreground leading-relaxed bg-card/60 p-2.5 rounded-lg border border-border/50 text-xs sm:text-sm">
                {word.usage}
              </p>
            </div>
          )}

          {/* Example Sentence */}
          {word.exampleJa && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ví dụ minh họa:
                </span>
                <button
                  onClick={() => onPlayExampleAudio(word.exampleJa)}
                  className={`text-xs flex items-center gap-1 font-medium px-2 py-0.5 rounded transition-colors ${
                    isExamplePlaying
                      ? 'bg-primary text-primary-foreground'
                      : 'text-primary hover:bg-primary/10'
                  }`}
                  title="Nghe câu ví dụ"
                >
                  <span>🔊 Nghe câu ví dụ</span>
                </button>
              </div>

              <div className="bg-card p-3 rounded-lg border border-border/80 space-y-1">
                <div className="ja-text text-base font-medium text-foreground">
                  {word.exampleJa}
                </div>
                {word.exampleReading && (
                  <div className="ja-text text-xs text-primary/90 font-normal">
                    {word.exampleReading}
                  </div>
                )}
                {word.exampleRomaji && (
                  <div className="text-xs text-muted-foreground font-mono romaji-text">
                    {word.exampleRomaji}
                  </div>
                )}
                <div className="text-xs font-medium text-foreground pt-1 border-t border-border/40 mt-1">
                  👉 {word.exampleVi}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {word.notes && (
            <div className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              <strong className="text-foreground font-semibold">💡 Lưu ý: </strong>
              {word.notes}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
            <div className="flex flex-wrap gap-3 text-xs pt-1">
              {word.synonyms.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Đồng nghĩa:</span>
                  <div className="flex gap-1 flex-wrap">
                    {word.synonyms.map((s, idx) => (
                      <span
                        key={idx}
                        className="ja-text px-2 py-0.5 rounded bg-card border border-border text-foreground font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Trái nghĩa:</span>
                  <div className="flex gap-1 flex-wrap">
                    {word.antonyms.map((a, idx) => (
                      <span
                        key={idx}
                        className="ja-text px-2 py-0.5 rounded bg-card border border-border text-foreground font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Subcomponent: List Item
// =========================================================================
function VocabularyListItem({
  word,
  isExpanded,
  onToggleExpand,
  isPlaying,
  isExamplePlaying,
  onPlayAudio,
  onPlayExampleAudio,
  isLearned,
  onToggleLearned,
}: WordCardProps) {
  return (
    <div
      className={`bg-card border rounded-xl transition-all duration-200 overflow-hidden shadow-sm ${
        isLearned ? 'border-success/40' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Word, Reading, Meaning */}
        <div className="flex items-start sm:items-center gap-4 flex-1">
          {/* Audio Button */}
          <button
            onClick={() => onPlayAudio(word.reading || word.word)}
            className={`p-2.5 rounded-full border transition-all shrink-0 ${
              isPlaying
                ? 'bg-primary text-primary-foreground border-primary scale-105'
                : 'bg-secondary text-foreground border-border hover:bg-primary/10 hover:text-primary'
            }`}
            title="Nghe phát âm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Word info */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="ja-text ja-medium font-bold text-foreground">
                {word.word}
              </span>
              <span className="ja-text text-sm font-semibold text-primary">
                ({word.reading})
              </span>
              <span className="text-xs text-muted-foreground font-mono romaji-text">
                {word.romaji}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-secondary text-muted-foreground border border-border">
                {word.wordType}
              </span>
            </div>
            <div className="text-sm font-medium text-foreground mt-0.5">
              {word.meaning}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={onToggleLearned}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
              isLearned
                ? 'bg-success/15 text-success border-success/30'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {isLearned ? '✓ Đã thuộc' : '+ Chưa học'}
          </button>

          <button
            onClick={onToggleExpand}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-secondary text-primary transition-colors flex items-center gap-1"
          >
            <span>{isExpanded ? 'Đóng' : 'Chi tiết'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded section in list view */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 bg-secondary/35 border-t border-border space-y-3 text-sm animate-fadeIn">
          {word.usage && (
            <p className="text-xs sm:text-sm text-foreground bg-card/70 p-2.5 rounded-lg border border-border/50">
              <strong className="text-muted-foreground">Cách dùng: </strong>
              {word.usage}
            </p>
          )}

          {word.exampleJa && (
            <div className="bg-card p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="ja-text text-base font-medium text-foreground">
                  {word.exampleJa}
                </span>
                <button
                  onClick={() => onPlayExampleAudio(word.exampleJa)}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    isExamplePlaying
                      ? 'bg-primary text-primary-foreground'
                      : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  🔊 Nghe
                </button>
              </div>
              <div className="ja-text text-xs text-primary/90">{word.exampleReading}</div>
              <div className="text-xs text-muted-foreground font-mono romaji-text">{word.exampleRomaji}</div>
              <div className="text-xs font-medium text-foreground pt-1 border-t border-border/40">
                👉 {word.exampleVi}
              </div>
            </div>
          )}

          {word.notes && (
            <div className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
              💡 {word.notes}
            </div>
          )}

          {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
            <div className="flex flex-wrap gap-3 text-xs pt-1">
              {word.synonyms.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Đồng nghĩa:</span>
                  {word.synonyms.map((s, idx) => (
                    <span key={idx} className="ja-text px-2 py-0.5 rounded bg-card border border-border font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {word.antonyms.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Trái nghĩa:</span>
                  {word.antonyms.map((a, idx) => (
                    <span key={idx} className="ja-text px-2 py-0.5 rounded bg-card border border-border font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
