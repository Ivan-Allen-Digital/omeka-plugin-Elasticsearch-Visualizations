<?php

abstract class Elasticsearch_Integration_BaseIntegration {
    protected $_active = true;
    protected $_docIndex = null;
    protected $_hooks = array();
    protected $_filters = array();

    /**
     * Elasticsearch_Integration_BaseIntegration constructor.
     *
     * @param $docIndex defines the elasticsearch index to use
     */
    public function __construct($docIndex) {
        $this->_docIndex = $docIndex;
        if(!isset($this->_docIndex) || $this->_docIndex == "") {
            throw Exception("docIndex parameter must be a non-empty string");
        }
    }

    /**
     * Initializes the integration before adding and hooks or filters.
     */
    public function initialize() {
    }

    /**
     * Returns whether this integration should be applied.
     *
     * @return boolean
     */
    public function isActive() {
        return $this->_active;
    }

    /**
     * Alias for applyHooksAndFilters method.
     */
    public function integrate() {
        $this->applyHooksAndFilters();
    }

    /**
     * Apply all hooks and filters implemented in this integration.
     */
    public function applyHooksAndFilters() {
        $className = get_called_class();
        if ($this->isActive()) {
            $this->_log("Applying hooks and filters for $className");
            $this->initialize();
            foreach ($this->_hooks as $hook) {
                add_plugin_hook($hook, array($this, 'hook' . Inflector::camelize($hook)));
            }
            foreach ($this->_filters as $filter) {
                add_filter($filter, array($this, 'filter' . Inflector::camelize($filter)));
            }
        }
    }

    /**
     * Returns the elasticsearch client.
     *
     * @return \Elasticsearch\Client
     */
    public function client(array $options = array()) {
        return Elasticsearch_Client::create($options);
    }

    /**
     * Logs an elasticsearch message.
     *
     * @param $msg
     */
    protected function _log($msg, $logLevel=Zend_Log::INFO) {
        _log('Elasticsearch: '.$msg, $logLevel);
    }

    /**
     * Format a date string as an ISO 8601 date, UTC timezone.
     *
     * @param $date
     * @return string
     */
    protected function _getDate($date) {
        $date = new DateTime($date);
        $date->setTimezone(new DateTimeZone('UTC'));
        return $date->format('c');
    }

    /**
     * Retrieve object records.
     *
     * @return array
     */
    protected function _fetchObjects($className) {
        if(!class_exists($className)) {
            $this->_log("Cannot fetch objects for $className because class does not exist!", Zend_Log::ERR);
            return null;
        }
        $db = get_db();
        $table = $db->getTable($className);
        $select = $table->getSelect();
        $table->applySorting($select, 'id', 'ASC');
        return $table->fetchObjects($select);
    }

}