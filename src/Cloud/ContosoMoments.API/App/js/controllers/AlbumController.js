﻿'use strict';

contosoMomentsApp
    .controller('albumsController', ['$scope', 'albumsService', 'authContext', '$state',
        function ($scope, albumsService, authContext, $state) {
            var self = this;


            self.albums = [];
            albumsService.getUserAlbums(authContext.userId).then(function (albums) {
                if (albums && angular.isArray(albums)) {
                    self.albums = albums;
                }
            });
            $scope.$on('albumCreated', function (e, album) {
                self.albums.push(album);
            });
            self.goToAlbum = function (album) {
                $state.go('main.gallery', { albumid: album.id });
            }

        }]);

contosoMomentsApp
    .controller('albumController', ['$scope', 'albumsService', 'imageService', 'appConfig', 'selectedImage', '$state', 'selectedAlbum', '$rootScope',
        function ($scope, albumsService, imageService, appConfig, selectedImage, $state, selectedAlbum, $rootScope) {
            var self = this;
            this.currentIndex = 0;
            this.count = 24;
            this.curAlbum = selectedAlbum.album;

            $rootScope.lastAlbum = selectedAlbum.album;
            var onImageGotten = function (images) {
                if (self.currentIndex === 0 && self.curAlbum.images.length === 0) {
                    self.curAlbum.images = images;
                    if (self.curAlbum.images.length >= (self.count - 1)) {
                        self.curAlbum.images[self.curAlbum.images.length - 1].showPlaceholder = true;
                    }
                } else if (self.currentIndex > 0 && self.curAlbum.images.length < (self.currentIndex + self.count - 1)) {
                    self.curAlbum.images[self.curAlbum.images.length - 1].showPlaceholder = images.length <= 0;
                    self.curAlbum.images = self.curAlbum.images.concat(images);
                    if (self.curAlbum.images.length === self.currentIndex + self.count) {
                        self.curAlbum.images[self.curAlbum.images.length - 1].showPlaceholder = true;
                    }
                }
            }
            this.getAlbumImages = function () {
                imageService.getImagesFromAlbum(self.curAlbum, { start: self.currentIndex, count: self.count }).then(onImageGotten);
            }
            this.showNext = function () {
                this.currentIndex += this.count;
                imageService.getImagesFromAlbum(self.curAlbum, { start: self.currentIndex, count: self.count }).then(onImageGotten)
            }
            this.getImageURL = function (img, size) {
                return imageService.getImageURL(img, size);
            }
            this.onImageSelected = function (image) {
                selectedImage.image = image;
                selectedImage.album = self.curAlbum;
                $state.go('main.singleImage', { imageid: image.id });
            }
            this.getAlbumImages();

            $scope.$on('imageUploaded', function (e, imageId) {
                imageService.getImageById(imageId).then(function (img) {
                    self.curAlbum.images.unshift(img[0]);
                });

            });

        }]);

contosoMomentsApp
    .controller('createAlbumController', ['$scope', 'albumsService', '$uibModalInstance', 'authService', 'selectedAlbum', '$rootScope',
        function ($scope, albumsService, $uibModalInstance, authService, selectedAlbum, $rootScope) {
            var self = this;

            self.postingAlbum = false;
            self.modalTitle = "Create Album";
            var editAlbum = function () {
                self.postingAlbum = true;
                albumsService.updateAlbum(selectedAlbum.album.id, self.currentAlbum.albumName).then(function (res) {
                    if (res) {
                        selectedAlbum.album = res;
                    }
                    $uibModalInstance.close(res);
                }).finally(function () {
                    self.postingAlbum = false;
                });
            }
            var createAlbum = function () {
                var auth = authService.currentContext();
                self.postingAlbum = true;
                albumsService.createAlbum(self.currentAlbum.albumName, auth.userId).then(function (res) {
                    $uibModalInstance.close(res);
                }).finally(function () {
                    self.postingAlbum = false;
                });

            }

            var postFunc = createAlbum;
            if (selectedAlbum.album != null) {
                self.currentAlbum = angular.copy(selectedAlbum.album);
                self.modalTitle = "Edit Album";
                postFunc = editAlbum;
            }
            self.post = function () {
                postFunc();
            }

            self.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            }

            $scope.$on('modal.closing', function (event) {
                if ($scope.uploading) {
                    event.preventDefault();
                }
            });

        }]);

contosoMomentsApp
    .controller('deleteAlbumController', ['$scope', 'albumsService', '$uibModalInstance', 'selectedAlbum', '$state',
        function ($scope, albumsService, $uibModalInstance, selectedAlbum, $state) {

            var self = this;

            self.deletingAlbum = false;
            self.enableDelete = true;

            $scope.albumName = selectedAlbum.album.albumName;

            if (selectedAlbum.album.id == "11111111-1111-1111-1111-111111111111") {
                self.deleteMessage = "Default Album cannot be deleted !";
                self.enableDelete = false;
            }
            else {
                self.deleteMessage = "You are about to delete " + selectedAlbum.album.albumName + " album, Are you sure? ";

            }




            self.deleteAlbum = function () {


                self.deletingAlbum = true;
                albumsService.deleteAlbum(selectedAlbum.album.id).then(function (res) {
                    $uibModalInstance.close(res);
                    $state.go($state.previous.name);

                }).finally(function () {
                    self.deletingAlbum = false;
                });

            }
            self.cancel = function () {
                $uibModalInstance.dismiss('cancel');
                self.enableDelete = true;

            }

            $scope.$on('modal.closing', function (event) {
                if ($scope.uploading) {
                    event.preventDefault();
                }
            });

        }]);