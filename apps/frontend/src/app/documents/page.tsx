'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, MoreVertical, FileText, Download, Share, Edit, Trash2 } from 'lucide-react';
import { documentsApi, Document } from '@/lib/api/documents';
import { useAlert } from '@/components/ui/alert-dialog';

export default function DocumentsPage() {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadClientId, setUploadClientId] = useState('');
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsApi.getAll(1, 50);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocuments = Array.isArray(documents) ? documents.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleUpload = async () => {
    if (!uploadFile) {
      showAlert('warning', 'Lütfen bir dosya seçiniz.');
      return;
    }

    setUploading(true);
    try {
      const uploadedDoc = await documentsApi.upload(uploadFile);
      
      if (uploadTitle || uploadCategory) {
        await documentsApi.update(uploadedDoc.id, {
          name: uploadTitle || uploadedDoc.name,
          category: uploadCategory,
        });
      }
      
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCategory('');
      setUploadClientId('');
      setUploadCaseId('');
      fetchDocuments();
      showAlert('success', 'Belge başarıyla yüklendi.');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error.response?.data?.message || 'Belge yüklenirken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setSelectedDoc(doc);
    setEditTitle(doc.name);
    setEditCategory(doc.category || '');
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDoc) return;
    
    try {
      await documentsApi.update(selectedDoc.id, {
        name: editTitle,
        category: editCategory,
      });
      setShowEditDialog(false);
      setSelectedDoc(null);
      fetchDocuments();
      showAlert('success', 'Belge başarıyla güncellendi.');
    } catch (error: any) {
      console.error('Error updating document:', error);
      const errorMessage = error.response?.data?.message || 'Belge güncellenirken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
    }
  };

  const handleDelete = (doc: Document) => {
    setSelectedDoc(doc);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    
    try {
      await documentsApi.delete(selectedDoc.id);
      setShowDeleteDialog(false);
      setSelectedDoc(null);
      fetchDocuments();
      showAlert('success', 'Belge başarıyla silindi.');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      const errorMessage = error.response?.data?.message || 'Belge silinirken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
      setShowDeleteDialog(false);
    }
  };

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Belgeler
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Belge yönetimi ve arşiv
            </p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Belge Yükle
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Belge ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Document List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg truncate">
                        {doc.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {doc.fileName}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {doc.category}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatFileSize(doc.size)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>{doc.mimeType}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Yükleme: {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('Download:', doc.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      İndir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('Share:', doc.id)}>
                      <Share className="w-4 h-4 mr-2" />
                      Paylaş
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz belge yüklenmemiş'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Belge Yükle</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dosya</label>
                <Input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Başlık</label>
                <Input
                  placeholder="Belge başlığı"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Input
                  placeholder="Örn: Dava, Sözleşme"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Yükleniyor...' : 'Yükle'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Belge Düzenle</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Başlık</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleSaveEdit}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belgeyi Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu belgeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
